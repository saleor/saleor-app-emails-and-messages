import { SALEOR_DOMAIN_HEADER } from "@saleor/app-sdk/const";
import {
  withRegisteredSaleorDomainHeader,
  withSaleorApp,
  withSaleorEventMatch,
  withWebhookSignatureVerified,
} from "@saleor/app-sdk/middleware";

const handler = async (request: any) => {
  // Make api call to get email HTML

  // Make api call to get email provider

  // Check if desired email provider is configured
  // If not DONT send error to saleor

  // Send email
  // abstraction func that receives email provider and email HTML
  // and sends email

  // return error to saleor only if the process of email sending has failed
  // (saleor reruns the webhook if error)

  return {
    status: 200,
  };
};

export default handler;

export const config = {
  api: {
    bodyParser: false,
  },
};
