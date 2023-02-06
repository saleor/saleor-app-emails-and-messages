import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import { saleorApp } from "../../../saleor-app";
import { logger as pinoLogger } from "../../../lib/logger";
import { getMjmlSettings } from "../../../modules/mjml/get-mjml-settings";
import { OrderCreatedWebhookPayloadFragment } from "../../../../generated/graphql";
import { compileMjml } from "../../../modules/mjml/compile-mjml";
import { compileHandlebarsTemplate } from "../../../modules/mjml/compile-handlebars-template";
import { sendEmailWithSmtp } from "../../../modules/mjml/send-email-with-smtp";
import { defaultOrderCreatedMjmlTemplate } from "../../../modules/mjml/default-templates";

const OrderCreatedWebhookPayload = gql`
  fragment OrderCreatedWebhookPayload on OrderCreated {
    order {
      id
      number
      userEmail
      channel {
        slug
      }
      user {
        email
        firstName
        lastName
      }
      billingAddress {
        streetAddress1
        city
        postalCode
        country {
          country
        }
      }
      shippingAddress {
        streetAddress1
        city
        postalCode
        country {
          country
        }
      }
      subtotal {
        gross {
          amount
          currency
        }
      }
      shippingPrice {
        gross {
          amount
          currency
        }
      }
      total {
        gross {
          amount
          currency
        }
      }
    }
  }
`;

const OrderCreatedGraphqlSubscription = gql`
  ${OrderCreatedWebhookPayload}
  subscription OrderCreated {
    event {
      ...OrderCreatedWebhookPayload
    }
  }
`;

export const orderCreatedWebhook = new SaleorAsyncWebhook<OrderCreatedWebhookPayloadFragment>({
  name: "Order Created in Saleor",
  webhookPath: "api/webhooks/order-created",
  asyncEvent: "ORDER_CREATED",
  apl: saleorApp.apl,
  subscriptionQueryAst: OrderCreatedGraphqlSubscription,
});

const handler: NextWebhookApiHandler<OrderCreatedWebhookPayloadFragment> = async (
  req,
  res,
  context
) => {
  const logger = pinoLogger.child({
    webhook: orderCreatedWebhook.name,
  });

  const { payload, authData } = context;
  const { order } = payload;

  if (!order) {
    logger.error("No order data payload");
    return res.status(200).end();
  }

  const recipientEmail = order.userEmail || order.user?.email;
  if (!recipientEmail?.length) {
    logger.error(`The order ${order.number} had no email recipient set. Aborting.`);
    return res
      .status(200)
      .json({ error: "Email recipient has not been specified in the event payload." });
  }

  const channel = order.channel.slug;

  const settings = await getMjmlSettings({ authData, channel });
  logger.info("start");

  const rawMjml = settings.templateOrderCreatedTemplate || defaultOrderCreatedMjmlTemplate;

  const { html: rawHtml, errors: mjmlCompilationErrors } = compileMjml(rawMjml);

  if (mjmlCompilationErrors.length) {
    logger.error("Error during the MJML compilation");
    logger.error(mjmlCompilationErrors);
    return res.status(400).json({ error: "Error during the MJML compilation" });
  }

  if (!rawHtml?.length) {
    logger.error("No HTML template returned after the compilation");
    return res.status(400).json({ error: "No HTML template returned after the compilation" });
  }

  const {
    htmlTemplate,
    plaintextTemplate,
    errors: handlebarsErrors,
  } = compileHandlebarsTemplate(rawHtml, payload);
  if (handlebarsErrors?.length) {
    logger.error("Error during the handlebars template compilation");
    return res.status(400).json({ error: "Error during the handlebars template compilation" });
  }

  if (!htmlTemplate?.length) {
    logger.error("The final email message is empty, skipping");
    return res.status(400).json({ error: "The final email message is empty, skipping" });
  }

  const { response, errors: smtpErrors } = await sendEmailWithSmtp({
    mailData: {
      text: plaintextTemplate,
      html: htmlTemplate,
      from: `${settings.senderName} <${settings.senderEmail}>`,
      to: recipientEmail,
      subject: settings.templateOrderCreatedSubject || "Your order has been created",
    },
    smtpSettings: {
      host: settings.smtpHost,
      port: parseInt(settings.smtpPort, 10),
    },
  });

  if (smtpErrors?.length) {
    logger.error(smtpErrors);
    return res.status(400).json({ errors: smtpErrors });
  }

  logger.info(response?.response);

  return res.status(200).json({ success: "The email has been sent" });
};

export default orderCreatedWebhook.createHandler(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
