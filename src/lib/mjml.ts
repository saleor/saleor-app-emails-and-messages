import mjml2html from "mjml";

export const compileMjml = (mjml: string) => {
  const { html } = mjml2html(mjml);

  return html;
};
