import nodemailer from "nodemailer";
import { logger as pinoLogger } from "../../lib/logger";

const logger = pinoLogger.child({
  fn: "sendEmailWithSmtp",
});

type SendMailProps = {
  smtpSettings: {
    host: string;
    port: number;
  };
  mailData: {
    from: string;
    to: string;
    text: string;
    html: string;
    subject: string;
  };
};

export const sendEmailWithSmtp = async ({ smtpSettings, mailData }: SendMailProps) => {
  try {
    const transporter = nodemailer.createTransport({
      ...smtpSettings,
    });

    const response = await transporter.sendMail({
      ...mailData,
    });
    logger.debug("An email has been sent");
    return { response };
  } catch (error) {
    logger.error("Error during sending the email");
    logger.error(error);
    return { errors: [{ message: error }] };
  }
};
