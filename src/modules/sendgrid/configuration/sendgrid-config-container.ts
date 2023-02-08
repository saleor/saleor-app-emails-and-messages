import { SendgridConfig as SendgridConfig, SellerShopConfig } from "./sendgrid-config";

export const getDefaultEmptySendgridConfiguration =
  (): SellerShopConfig["sendgridConfiguration"] => {
    const defaultConfig = {
      active: false,
      sandboxMode: false,
      senderName: "",
      senderEmail: "",
      apiKey: "",
      templateOrderCreatedSubject: "Order confirmed",
      templateOrderCreatedTemplate: "",
      templateOrderFulfilledSubject: "Order fulfilled",
      templateOrderFulfilledTemplate: "",
    };

    if (process.env.NODE_ENV === "development") {
      return {
        ...defaultConfig,
        active: true,
        sandboxMode: true,
        senderName: "Development Sender",
        senderEmail: (process.env.SENDGRID_SENDER_EMAIL as string) || "dev@example.com",
        apiKey: process.env.SENDGRID_API_KEY as string,
      };
    }

    return defaultConfig;
  };

const getChannelSendgridConfiguration =
  (sendgridConfig: SendgridConfig | null | undefined) => (channelSlug: string) => {
    try {
      // TODO: Should default empty config be returned here?
      return (
        sendgridConfig?.shopConfigPerChannel[channelSlug].sendgridConfiguration ??
        getDefaultEmptySendgridConfiguration()
      );
    } catch (e) {
      return null;
    }
  };

const setChannelSendgridConfiguration =
  (sendgridConfig: SendgridConfig | null | undefined) =>
  (channelSlug: string) =>
  (sendgridConfiguration: SellerShopConfig["sendgridConfiguration"]) => {
    const sendgridConfigNormalized = structuredClone(sendgridConfig) ?? {
      shopConfigPerChannel: {},
    };

    sendgridConfigNormalized.shopConfigPerChannel[channelSlug] ??= {
      sendgridConfiguration: getDefaultEmptySendgridConfiguration(),
    };
    sendgridConfigNormalized.shopConfigPerChannel[channelSlug].sendgridConfiguration =
      sendgridConfiguration;

    return sendgridConfigNormalized;
  };

export const SendgridConfigContainer = {
  getChannelSendgridConfiguration: getChannelSendgridConfiguration,
  setChannelSendgridConfiguration: setChannelSendgridConfiguration,
};
