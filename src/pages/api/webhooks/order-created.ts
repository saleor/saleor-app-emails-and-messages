import { SALEOR_AUTHORIZATION_BEARER_HEADER, SALEOR_DOMAIN_HEADER } from "@saleor/app-sdk/const";
import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";

import { gql } from "urql";
import { OrderCreatedWebhookPayloadFragment } from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { createClient } from "../../../lib/graphql";
import { createSettingsManager } from "../../../lib/metadata";
import { compileMjml } from "../../../lib/mjml";
import { sendMail } from "../../../lib/smtp";
import { compileTemplate } from "../../../lib/template";

const OrderCreatedWebhookPayload = gql`
  fragment OrderCreatedWebhookPayload on OrderCreated {
    order {
      id
      number
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
  const saleorDomain = req.headers[SALEOR_DOMAIN_HEADER] as string;

  const { payload, authData } = context;

  const client = createClient(`https://${saleorDomain}/graphql/`, async () =>
    Promise.resolve({ token: authData.token })
  );

  const settings = createSettingsManager(client);

  const getMjmlEmail = async () => {
    // TODO: move it to lib handler
    const res = await fetch("http://localhost:3000/api/metadata", {
      method: "GET",
      headers: [
        ["content-type", "application/json"],
        [SALEOR_DOMAIN_HEADER, authData.domain],
        [SALEOR_AUTHORIZATION_BEARER_HEADER, authData.token],
      ],
    });

    const response = await res.json();

    const template = JSON.parse(response.metadata[0].value).mjmlTemplate;

    return template;
  };

  const rawMjml = await getMjmlEmail();

  const rawHtml = compileMjml(rawMjml);

  const { htmlTemplate, plaintextTemplate } = compileTemplate(rawHtml, payload);

  // Check if desired email provider is configured
  // If not don't send error to saleor

  const data = await settings.get("mailhog");

  const { smtpHost, smtpPort } = JSON.parse(data ?? "{}");

  const messageId = await sendMail({
    mailData: {
      text: plaintextTemplate,
      html: htmlTemplate,
      from: "Saleor Mailing Bot <mail@saleor.io>",
      to: "test@user.com",
      subject: "Your order has been created",
    },
    smtpSettings: {
      host: smtpHost,
      port: smtpPort,
    },
  });

  console.log("Message sent: %s", messageId);

  // return error to saleor only if the process of email sending has failed
  // (saleor reruns the webhook if error)

  return res.status(200).json({ status: "git" });
};

export default orderCreatedWebhook.createHandler(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
