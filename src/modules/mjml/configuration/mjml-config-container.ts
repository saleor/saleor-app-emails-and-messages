import { MjmlConfig, SellerShopConfig } from "./mjml-config";
import {
  defaultOrderCreatedMjmlTemplate,
  defaultOrderFulfilledMjmlTemplate,
} from "../default-templates";

export const getDefaultEmptyMjmlConfiguration = (): SellerShopConfig["mjmlConfiguration"] => {
  const defaultConfig = {
    active: false,
    senderName: "",
    senderEmail: "",
    smtpHost: "",
    smtpPort: "",
    smtpUser: "",
    useTls: false,
    useSsl: false,
    templateOrderCreatedSubject: "Order confirmed",
    templateOrderCreatedTemplate: defaultOrderCreatedMjmlTemplate,
    templateOrderFulfilledSubject: "Order fulfilled",
    templateOrderFulfilledTemplate: defaultOrderFulfilledMjmlTemplate,
  };

  if (process.env.NODE_ENV === "development") {
    return {
      ...defaultConfig,
      active: true,
      senderName: "Development Sender",
      senderEmail: "dev@example.com",
      smtpHost: "localhost",
      smtpPort: "1025",
    };
  }

  return defaultConfig;
};

const getChannelMjmlConfiguration =
  (mjmlConfig: MjmlConfig | null | undefined) => (channelSlug: string) => {
    try {
      // TODO: Should default empty config be returned here?
      return (
        mjmlConfig?.shopConfigPerChannel[channelSlug].mjmlConfiguration ??
        getDefaultEmptyMjmlConfiguration()
      );
    } catch (e) {
      return null;
    }
  };

const setChannelMjmlConfiguration =
  (mjmlConfig: MjmlConfig | null | undefined) =>
  (channelSlug: string) =>
  (mjmlConfiguration: SellerShopConfig["mjmlConfiguration"]) => {
    const mjmlConfigNormalized = structuredClone(mjmlConfig) ?? { shopConfigPerChannel: {} };

    mjmlConfigNormalized.shopConfigPerChannel[channelSlug] ??= {
      mjmlConfiguration: getDefaultEmptyMjmlConfiguration(),
    };
    mjmlConfigNormalized.shopConfigPerChannel[channelSlug].mjmlConfiguration = mjmlConfiguration;

    return mjmlConfigNormalized;
  };

export const MjmlConfigContainer = {
  getChannelMjmlConfiguration: getChannelMjmlConfiguration,
  setChannelMjmlConfiguration: setChannelMjmlConfiguration,
};
