import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";

import packageJson from "../../../package.json";
import { orderCreatedWebhook } from "./webhooks/order-created";

export default createManifestHandler({
  async manifestFactory(context) {
    const manifest: AppManifest = {
      name: packageJson.name,
      tokenTargetUrl: `${context.appBaseUrl}/api/register`,
      appUrl: context.appBaseUrl,
      permissions: [
        "MANAGE_ORDERS",
        /**
         * Set permissions for app if needed
         * https://docs.saleor.io/docs/3.x/developer/permissions
         */
      ],
      id: "saleor.app.mailing",
      version: packageJson.version,
      webhooks: [orderCreatedWebhook.getWebhookManifest(context.appBaseUrl)],
      extensions: [
        /**
         * Optionally, extend Dashboard with custom UIs
         * https://docs.saleor.io/docs/3.x/developer/extending/apps/extending-dashboard-with-apps
         */
      ],
    };

    return manifest;
  },
});
