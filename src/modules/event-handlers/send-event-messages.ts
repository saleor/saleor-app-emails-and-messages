import { AuthData } from "@saleor/app-sdk/APL";
import { logger as pinoLogger } from "../../lib/logger";
import { sendMjml } from "../mjml/send-mjml";
import { sendSendgrid } from "../sendgrid/send-sendgrid";
import { MessageEventTypes } from "./message-event-types";

interface SendEventMessagesArgs {
  recipientEmail: string;
  channel: string;
  event: MessageEventTypes;
  authData: AuthData;
  payload: any;
}

export const sendEventMessages = async ({
  recipientEmail,
  channel,
  event,
  authData,
  payload,
}: SendEventMessagesArgs) => {
  const logger = pinoLogger.child({
    fn: "sendEventMessages",
  });

  const mjmlStatus = await sendMjml({
    authData,
    channel,
    event,
    payload,
    recipientEmail,
  });

  if (mjmlStatus?.errors.length) {
    logger.error("MJML errors");
    logger.error(mjmlStatus?.errors);
  }

  const sendgridStatus = await sendSendgrid({
    authData,
    channel,
    event,
    payload,
    recipientEmail,
  });

  if (sendgridStatus?.errors.length) {
    logger.error("Sending message with Sendgrid has failed");
    logger.error(mjmlStatus?.errors);
  }
};
