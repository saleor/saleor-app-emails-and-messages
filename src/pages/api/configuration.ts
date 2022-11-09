import type { NextApiRequest, NextApiResponse } from "next";
import { SALEOR_DOMAIN_HEADER } from "@saleor/app-sdk/const";
import { SettingsManager } from "@saleor/app-sdk/settings-manager";

import { createClient } from "../../lib/graphql";
import { createSettingsManager } from "../../lib/metadata";
import { saleorApp } from "../../../saleor-app";

// Interfaces below are shared with the client part to ensure we use the same
// shape of the data for communication. It's completely optional, but makes
// refactoring much easier.
export interface SettingsUpdateApiRequest {
  isActive: boolean;
  client: string;
  mailhog?: Mailhog;
  smtp?: SMTP;
}

export interface Mailhog {
  smtpHost: string;
  smtpPort: string;
}

export interface SMTP {
  smtpHost: string;
  smtpPort: string;
  user?: string;
  // FIXME: should be stored as secure
  password?: string;
  useTLS: boolean;
  useSSL: boolean;
}

export interface SettingsApiResponse {
  success: boolean;
  data?: {
    isActive: boolean;
    client: string;
    mailhog?: Mailhog;
    smtp?: SMTP;
  };
}

// If your app store secrets like API keys, it is a good practice to not send
// them to client application if thats not required.
// Obfuscate function will hide secret value with dots, leaving only last 4
// characters which should be enough for the user to know if thats a right value.
const obfuscateSecret = (secret: string) => {
  try {
    return "*".repeat(secret.length - 4) + secret.substring(secret.length - 4);
  } catch {
    return "";
  }
};

// Helper function to minimize duplication and keep the same response structure.
// Even multiple calls of `get` method will result with only one call to the database.
const sendResponse = async (
  res: NextApiResponse<SettingsApiResponse>,
  statusCode: number,
  settings: SettingsManager,
  domain: string
) => {
  const mailhogStr = await settings.get("mailhog");
  const mailhog = mailhogStr ? JSON.parse(mailhogStr) : null;
  const smtpStr = await settings.get("smtp");
  const smtp = smtpStr ? JSON.parse(smtpStr) : null;
  const isActive = (await settings.get("isActive")) || "false";
  res.status(statusCode).json({
    success: statusCode === 200,
    data: {
      isActive: isActive === "true",
      client: (await settings.get("client")) || "",
      mailhog: mailhog,
      smtp: smtp,
    },
  });
};

// Main body of our settings endpoint. It's available at `api/settings` url.
// Using GET method will return existing values, and POST is used to modify them.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SettingsApiResponse>
) {
  const saleorDomain = req.headers[SALEOR_DOMAIN_HEADER] as string;
  const authData = await saleorApp.apl.get(saleorDomain);
  if (!authData) {
    console.debug(`Could not find auth data for the domain ${saleorDomain}.`);
    res.status(401).json({ success: false });
    return;
  }

  // To make queries to Saleor API we need urql client
  const client = createClient(`http://${saleorDomain}/graphql/`, async () =>
    Promise.resolve({ token: authData.token })
  );

  // Helper located at `src/lib/metadata.ts` returns manager which will be used to
  // get or modify metadata.
  const settings = createSettingsManager(client);

  if (req.method === "GET") {
    await sendResponse(res, 200, settings, saleorDomain);
    return;
  } else if (req.method === "POST") {
    const { client, isActive, mailhog, smtp } = req.body as SettingsUpdateApiRequest;

    if (client && (mailhog || smtp)) {
      // You can set metadata one by one, but passing array of the values
      // will spare additional roundtrips to the Saleor API.
      // After mutation is made, internal cache of the manager
      // will be automatically updated
      const mailhogData = mailhog ? JSON.stringify(mailhog) : null;
      const smtpData = smtp ? JSON.stringify(smtp) : null;
      const data = [
        { key: "client", value: client },
        { key: "isActive", value: String(isActive) },
      ];
      if (smtpData) {
        data.push({ key: "smtp", value: smtpData });
      }
      if (mailhogData) {
        data.push({ key: "mailhog", value: mailhogData });
      }
      await settings.set(data);

      await sendResponse(res, 200, settings, saleorDomain);
      return;
    } else {
      console.log("Missing Settings Values");
      await sendResponse(res, 400, settings, saleorDomain);
      return;
    }
  }
  res.status(405).end();
  return;
}
