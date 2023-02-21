import { logger as pinoLogger } from "../../lib/logger";
import { AuthData } from "@saleor/app-sdk/APL";
import { MjmlConfiguration } from "./configuration/mjml-config";
import { getActiveMjmlSettings } from "./get-active-mjml-settings";
import {
  defaultInvoiceSentMjmlTemplate,
  defaultOrderCancelledMjmlTemplate,
  defaultOrderConfirmedMjmlTemplate,
  defaultOrderCreatedMjmlTemplate,
  defaultOrderFulfilledMjmlTemplate,
  defaultOrderFullyPaidMjmlTemplate,
} from "./default-templates";
import { compileMjml } from "./compile-mjml";
import { compileHandlebarsTemplate } from "./compile-handlebars-template";
import { sendEmailWithSmtp } from "./send-email-with-smtp";
import { MessageEventTypes } from "../event-handlers/message-event-types";

interface SendMjmlArgs {
  authData: AuthData;
  channel: string;
  recipientEmail: string;
  event: MessageEventTypes;
  payload: any;
}

export interface EmailServiceResponse {
  errors?: {
    code: number;
    message: string;
  }[];
}

const eventMapping = (event: SendMjmlArgs["event"], settings: MjmlConfiguration) => {
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
    case "ORDER_CONFIRMED":
      return {
        template: settings.templateOrderConfirmedTemplate || defaultOrderConfirmedMjmlTemplate,
        subject: settings.templateOrderConfirmedSubject || "Order confirmed",
      };
    case "ORDER_CANCELLED":
      return {
        template: settings.templateOrderCancelledTemplate || defaultOrderCancelledMjmlTemplate,
        subject: settings.templateOrderCancelledSubject || "Order cancelled",
      };
    case "ORDER_FULLY_PAID":
      return {
        template: settings.templateOrderFullyPaidTemplate || defaultOrderFullyPaidMjmlTemplate,
        subject: settings.templateOrderFullyPaidSubject || "Order fully paid",
      };
    case "INVOICE_SENT":
      return {
        template: settings.templateInvoiceSentTemplate || defaultInvoiceSentMjmlTemplate,
        subject: settings.templateInvoiceSentSubject || "Invoice sent",
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

  const settings = await getActiveMjmlSettings({ authData, channel });

  if (!settings) {
    logger.debug("No active settings, skipping");
    return {
      errors: [
        {
          message: "No active settings",
        },
      ],
    };
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
