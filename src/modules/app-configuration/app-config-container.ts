import { AppConfig, SellerShopConfig } from "./app-config";

const getDefaultEmptyAppConfiguration = (): SellerShopConfig["appConfiguration"] => ({
  active: false,
});

const getChannelAppConfiguration =
  (appConfig: AppConfig | null | undefined) => (channelSlug: string) => {
    try {
      return appConfig?.shopConfigPerChannel[channelSlug].appConfiguration ?? null;
    } catch (e) {
      return null;
    }
  };

const setChannelAppConfiguration =
  (appConfig: AppConfig | null | undefined) =>
  (channelSlug: string) =>
  (appConfiguration: SellerShopConfig["appConfiguration"]) => {
    const appConfigNormalized = structuredClone(appConfig) ?? { shopConfigPerChannel: {} };

    appConfigNormalized.shopConfigPerChannel[channelSlug] ??= {
      appConfiguration: getDefaultEmptyAppConfiguration(),
    };
    appConfigNormalized.shopConfigPerChannel[channelSlug].appConfiguration = appConfiguration;

    return appConfigNormalized;
  };

export const AppConfigContainer = {
  getChannelAppConfiguration,
  setChannelAppConfiguration,
};
