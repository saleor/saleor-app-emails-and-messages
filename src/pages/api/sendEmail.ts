import { NextApiRequest } from "next";
import { sendMail } from "../../lib/smtp";

const handler = async (request: NextApiRequest) => {
  const { htmlPart, textPart, from, to, subject } = request.body;

  const messageId = sendMail({ from, to, subject, text: textPart, html: htmlPart });

  // const transporter = nodemailer.createTransport({
  //   port: 1025,
  // });

  // const info = await transporter.sendMail({
  //   from,
  //   to,
  //   subject,
  //   text: textPart,
  //   html: htmlPart,
  // });

  console.log("Message sent: %s", messageId);

  return {
    status: 200,
  };
};

export default handler;
