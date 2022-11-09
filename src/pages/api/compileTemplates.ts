import { NextApiRequest, NextApiResponse } from "next";
import { compileTemplate } from "../../lib/template";

const handler = async (request: NextApiRequest, response: NextApiResponse) => {
  const { html, variables } = request.body;

  const { htmlTemplate, plaintextTemplate } = compileTemplate(html, variables);

  response.status(200).json({
    compiledHTMLTemplate: htmlTemplate,
    compiledPlaintextTemplate: plaintextTemplate,
  });
};

export default handler;
