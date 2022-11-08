import Handlebars from "handlebars";
import { convert } from "html-to-text";
import mjml2html from "mjml";
import nodemailer from "nodemailer";

import { MJML_DEFAULT_TEMPLATE } from "../../consts";

const handler = async (request: any) => {
  const transporter = nodemailer.createTransport({
    port: 1025,
  });

  const { html } = mjml2html(MJML_DEFAULT_TEMPLATE);

  const template = Handlebars.compile(html);

  const compiledTemplate = template({
    order: {
      order_details_url: "https://saleor.io",
    },
  });

  const info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>',
    to: "bar@example.com",
    subject: "Hello ✔",
    text: convert(compiledTemplate),
    html: compiledTemplate,
  });

  console.log("Message sent: %s", info.messageId);

  return {
    status: 200,
  };
};

export default handler;
