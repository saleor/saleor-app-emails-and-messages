import Handlebars from "handlebars";
import { convert } from "html-to-text";

export const compileTemplate = (html: string, variables: any) => {
  const template = Handlebars.compile(html);

  const compiledTemplate = template(variables);

  return {
    htmlTemplate: compiledTemplate,
    plaintextTemplate: convert(compiledTemplate),
  };
};
