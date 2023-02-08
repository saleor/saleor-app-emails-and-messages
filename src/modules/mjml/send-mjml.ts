import { logger as pinoLogger } from "../../lib/logger";
import { AuthData } from "@saleor/app-sdk/APL";
import { SellerShopConfig } from "./configuration/mjml-config";
import { getMjmlSettings } from "./get-mjml-settings";
import {
  defaultOrderCreatedMjmlTemplate,
  defaultOrderFulfilledMjmlTemplate,
} from "./default-templates";
import { compileMjml } from "./compile-mjml";
import { compileHandlebarsTemplate } from "./compile-handlebars-template";
import { sendEmailWithSmtp } from "./send-email-with-smtp";

interface SendMjmlArgs {
  authData: AuthData;
  channel: string;
  recipientEmail: string;
  event: "ORDER_CREATED" | "ORDER_FULFILLED";
  payload: any;
}

export interface EmailServiceResponse {
  errors?: {
    code: number;
    message: string;
  }[];
}

const eventMapping = (
  event: SendMjmlArgs["event"],
  settings: SellerShopConfig["mjmlConfiguration"]
) => {
  switch (event) {
    case "ORDER_CREATED":
      return {
        template: settings.templateOrderCreatedTemplate || defaultOrderCreatedMjmlTemplate,
        subject: settings.templateOrderCreatedSubject || "Order created",
      };
    case "ORDER_FULFILLED":
      return {
        template: settings.templateOrderFulfilledTemplate || defaultOrderFulfilledMjmlTemplate,
        subject: settings.templateOrderFulfilledSubject || "Order fulfilled",
      };
  }
};

export const sendMjml = async ({
  authData,
  channel,
  payload,
  recipientEmail,
  event,
}: SendMjmlArgs) => {
  const logger = pinoLogger.child({
    fn: "sendMjml",
    event,
  });

  const settings = await getMjmlSettings({ authData, channel });

  if (!settings.active) {
    logger.debug("MJML is not active, skipping");
  }

  logger.debug("Sending an email using MJML");

  const { template: rawMjml, subject } = eventMapping(event, settings);

  const { html: rawHtml, errors: mjmlCompilationErrors } = compileMjml(rawMjml);

  if (mjmlCompilationErrors.length) {
    logger.error("Error during the MJML compilation");
    logger.error(mjmlCompilationErrors);
    return {
      errors: [
        {
          message: "Error during the MJML compilation. Please Validate your MJML template",
        },
      ],
    };
  }

  if (!rawHtml?.length) {
    logger.error("No HTML template returned after the compilation");
    return {
      errors: [{ message: "No HTML template returned after the compilation" }],
    };
  }

  const {
    htmlTemplate,
    plaintextTemplate,
    errors: handlebarsErrors,
  } = compileHandlebarsTemplate(rawHtml, payload);
  if (handlebarsErrors?.length) {
    logger.error("Error during the handlebars template compilation");
    return {
      errors: [{ message: "Error during the handlebars template compilation" }],
    };
  }

  if (!htmlTemplate?.length) {
    logger.error("The final email message is empty, skipping");
    return {
      errors: [{ message: "The final email message is empty, skipping" }],
    };
  }

  const { response, errors: smtpErrors } = await sendEmailWithSmtp({
    mailData: {
      text: plaintextTemplate,
      html: htmlTemplate,
      from: `${settings.senderName} <${settings.senderEmail}>`,
      to: recipientEmail,
      subject,
    },
    smtpSettings: {
      host: settings.smtpHost,
      port: parseInt(settings.smtpPort, 10),
    },
  });

  if (smtpErrors?.length) {
    return { errors: smtpErrors };
  }
  logger.debug(response?.response);
};
