export interface SellerShopConfig {
  sendgridConfiguration: {
    active: boolean;
    sandboxMode: boolean;
    senderName: string;
    senderEmail: string;
    apiKey: string;
    templateOrderCreatedSubject: string;
    templateOrderCreatedTemplate: string;
    templateOrderFulfilledSubject: string;
    templateOrderFulfilledTemplate: string;
  };
}

export type ShopConfigPerChannelSlug = Record<string, SellerShopConfig>;

export type SendgridConfig = {
  shopConfigPerChannel: ShopConfigPerChannelSlug;
};
