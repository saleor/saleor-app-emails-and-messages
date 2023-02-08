import Handlebars from "handlebars";
import { convert } from "html-to-text";
import { logger as pinoLogger } from "../../lib/logger";

const logger = pinoLogger.child({
  fn: "compileHandlebarsTemplate",
});

export const compileHandlebarsTemplate = (html: string, variables: any) => {
  logger.debug("Compiling HTML using handlebars templates");
  try {
    const template = Handlebars.compile(html);
    const htmlTemplate = template(variables);
    // TODO: Investigate - some emails can not be converted to the plaintext
    const plaintextTemplate = convert(htmlTemplate);
    logger.debug("Template successfully compiled");
    return {
      htmlTemplate,
      plaintextTemplate,
    };
  } catch (error) {
    logger.error(error);
    return {
      errors: [{ message: "Error during the using the handlebars template" }],
    };
  }
};
