import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";

import { gql } from "urql";
import { OrderCreatedWebhookPayloadFragment } from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { MJML_DEFAULT_TEMPLATE } from "../../../consts";
import mjml from "../../../lib/mjml";

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
  const { payload, authData } = context;

  // fake func
  const getMjmlEmail = async () => {
    // TO-DO
    return MJML_DEFAULT_TEMPLATE;
  };

  const rawMjml = await getMjmlEmail();

  // TO-DO
  // Make api call to get email in mjml from metadata
  const rawHtml = mjml(rawMjml);

  //
  console.log(rawHtml);

  // TO-DO
  // Make api call to get email provider

  // Check if desired email provider is configured
  // If not DONT send error to saleor

  // Send email
  // abstraction func that receives email provider and email HTML
  // and sends email

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
