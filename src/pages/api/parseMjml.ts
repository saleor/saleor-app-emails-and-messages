import compileMjml from "../../lib/mjml";

const handler = async (request: any, response: any) => {
  const { mjml } = request.body;

  const rawHtml = compileMjml(mjml);

  return response.status(200).json({ rawHtml });
};

export default handler;
