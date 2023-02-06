export interface SellerShopConfig {
  appConfiguration: {
    active: string;
  };
}

export type ShopConfigPerChannelSlug = Record<string, SellerShopConfig>;

export type AppConfig = {
  shopConfigPerChannel: ShopConfigPerChannelSlug;
};
