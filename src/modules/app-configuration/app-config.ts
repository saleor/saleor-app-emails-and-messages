export interface SellerShopConfig {
  appConfiguration: {
    active: boolean;
    mjmlConfigurationId?: string;
    sendgridConfigurationId?: string;
  };
}

export type ShopConfigPerChannelSlug = Record<string, SellerShopConfig>;

export type AppConfig = {
  shopConfigPerChannel: ShopConfigPerChannelSlug;
};
