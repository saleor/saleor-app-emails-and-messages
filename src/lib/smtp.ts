import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  port: 1025,
});

export const sendMail = async ({
  from,
  to,
  subject,
  text,
  html,
}: {
  from: string;
  to: string;
  text: string;
  html: string;
  subject: string;
}) => {
  const response = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });

  return response.messageId;
};
