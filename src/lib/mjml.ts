import mjml2html from "mjml";

const compileMjml = (mjml: string) => {
  const { html } = mjml2html(mjml);

  return html;
};

export default compileMjml;
