import mjml2html from "mjml";

const handler = async (request: any, response: any) => {
  const { mjml } = request.body;

  const { html } = mjml2html(mjml);

  return response.status(200).json({ rawHtml: html });
};

export default handler;
