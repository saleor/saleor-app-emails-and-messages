export interface MjmlConfiguration {
  active: boolean;
  configurationName: string;
  senderName: string;
  senderEmail: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  useTls: boolean;
  useSsl: boolean;
  templateInvoiceSentSubject: string;
  templateInvoiceSentTemplate: string;
  templateOrderCancelledSubject: string;
  templateOrderCancelledTemplate: string;
  templateOrderConfirmedSubject: string;
  templateOrderConfirmedTemplate: string;
  templateOrderFullyPaidSubject: string;
  templateOrderFullyPaidTemplate: string;
  templateOrderCreatedSubject: string;
  templateOrderCreatedTemplate: string;
  templateOrderFulfilledSubject: string;
  templateOrderFulfilledTemplate: string;
}

export type MjmlConfigurationsIdMap = Record<string, MjmlConfiguration>;

export type MjmlConfig = {
  availableConfigurations: MjmlConfigurationsIdMap;
};
