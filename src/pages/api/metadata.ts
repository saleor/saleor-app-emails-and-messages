import type { NextApiRequest, NextApiResponse } from "next";
import { SALEOR_DOMAIN_HEADER } from "@saleor/app-sdk/const";
import { SettingsManager } from "@saleor/app-sdk/settings-manager";

import { createClient } from "../../lib/graphql";
import { fetchAllMetadata, mutateMetadata } from "../../lib/metadata";
import { saleorApp } from "../../../saleor-app";

// Main body of our settings endpoint. It's available at `api/settings` url.
// Using GET method will return existing values, and POST is used to modify them.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const saleorDomain = req.headers[SALEOR_DOMAIN_HEADER] as string;
  const authData = await saleorApp.apl.get(saleorDomain);
  console.log(authData);
  if (!authData) {
    console.debug(`Could not find auth data for the domain ${saleorDomain}.`);
    res.status(401).json({ success: false });
    return;
  }

  // To make queries to Saleor API we need urql client
  const client = createClient(`https://${saleorDomain}/graphql/`, async () =>
    Promise.resolve({ token: authData.token })
  );

  if (req.method === "GET") {
    const metadata = await fetchAllMetadata(client);
    return res.status(200).json({ success: true, metadata });
  } else if (req.method === "POST") {
    try {
      const res = await mutateMetadata(client, req.body);
      console.log({ res });
    } catch (e) {
      console.log(e);
    }

    return res.status(200).json({ success: true });
  }
  res.status(405).end();
  return;
}
