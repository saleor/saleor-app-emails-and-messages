export interface SellerShopConfig {
  mjmlConfiguration: {
    active: boolean;
    senderName: string;
    senderEmail: string;
    smtpHost: string;
    smtpPort: string;
    smtpUser: string;
    useTls: boolean;
    useSsl: boolean;
    templateOrderCreatedSubject: string;
    templateOrderCreatedTemplate: string;
    templateOrderFulfilledSubject: string;
    templateOrderFulfilledTemplate: string;
  };
}

export type ShopConfigPerChannelSlug = Record<string, SellerShopConfig>;

export type MjmlConfig = {
  shopConfigPerChannel: ShopConfigPerChannelSlug;
};
