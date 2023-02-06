import mjml2html from "mjml";
import { logger as pinoLogger } from "../../lib/logger";

const logger = pinoLogger.child({
  fn: "compileMjml",
});

export const compileMjml = (mjml: string) => {
  try {
    return mjml2html(mjml);
  } catch (error) {
    logger.error("MJML to HTML compilation failed");
    return {
      html: undefined,
      errors: [{ message: "Critical error during the mjml to html compilation" }],
    };
  }
};
