import nodemailer from "nodemailer";

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

export const sendMail = async ({ smtpSettings, mailData }: SendMailProps) => {
  const transporter = nodemailer.createTransport({
    ...smtpSettings,
  });

  const response = await transporter.sendMail({
    ...mailData,
  });

  return response.messageId;
};
