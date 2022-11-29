import { SALEOR_DOMAIN_HEADER } from "@saleor/app-sdk/const";
import { NextWebhookApiHandler } from "@saleor/app-sdk/handlers/next";

import { saleorApp } from "../../../saleor-app";
import { createClient } from "../../lib/graphql";
import { createSettingsManager } from "../../lib/metadata";
import { sendMail } from "../../lib/smtp";
import { compileTemplate } from "../../lib/template";

const handler: NextWebhookApiHandler = async (req, res) => {
  const saleorDomain = req.headers[SALEOR_DOMAIN_HEADER] as string;

  const authData = await saleorApp.apl.get(saleorDomain);

  if (!authData) {
    console.debug(`Could not find auth data for the domain ${saleorDomain}.`);
    res.status(401).json({ success: false });
    return;
  }

  const client = createClient(`https://${saleorDomain}/graphql/`, async () =>
    Promise.resolve({ token: authData.token })
  );

  const settings = createSettingsManager(client);

  const { rawHtml, email } = req.body;

  // We don't have sample data to pass to handlebars for all events
  const { htmlTemplate, plaintextTemplate } = compileTemplate(rawHtml, {});

  const data = await settings.get("mailhog");
  const { smtpHost, smtpPort } = JSON.parse(data ?? "{}");

  const messageId = await sendMail({
    mailData: {
      text: plaintextTemplate,
      html: htmlTemplate,
      from: "Saleor Mailing Bot <mail@saleor.io>",
      to: email,
      subject: "Your order has been created",
    },
    smtpSettings: {
      host: smtpHost,
      port: smtpPort,
    },
  });

  console.log("Message sent: %s", messageId);

  return res.status(200).json({ status: "ok 👌🏻" });
};

export default handler;
