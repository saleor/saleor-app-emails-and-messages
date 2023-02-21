import { MjmlConfig, MjmlConfiguration } from "./mjml-config";
import {
  defaultInvoiceSentMjmlTemplate,
  defaultOrderCancelledMjmlTemplate,
  defaultOrderConfirmedMjmlTemplate,
  defaultOrderCreatedMjmlTemplate,
  defaultOrderFulfilledMjmlTemplate,
  defaultOrderFullyPaidMjmlTemplate,
} from "../default-templates";

export const getDefaultEmptyMjmlConfiguration = (): MjmlConfiguration => {
  const defaultConfig = {
    active: true,
    configurationName: "",
    senderName: "",
    senderEmail: "",
    smtpHost: "",
    smtpPort: "",
    smtpUser: "",
    useTls: false,
    useSsl: false,
    templateInvoiceSentSubject: "Invoice sent",
    templateInvoiceSentTemplate: defaultInvoiceSentMjmlTemplate,
    templateOrderCancelledSubject: "Order Cancelled",
    templateOrderCancelledTemplate: defaultOrderCancelledMjmlTemplate,
    templateOrderConfirmedSubject: "Order Confirmed",
    templateOrderConfirmedTemplate: defaultOrderConfirmedMjmlTemplate,
    templateOrderFullyPaidSubject: "Order Fully Paid",
    templateOrderFullyPaidTemplate: defaultOrderFullyPaidMjmlTemplate,
    templateOrderCreatedSubject: "Order created",
    templateOrderCreatedTemplate: defaultOrderCreatedMjmlTemplate,
    templateOrderFulfilledSubject: "Order fulfilled",
    templateOrderFulfilledTemplate: defaultOrderFulfilledMjmlTemplate,
  };

  return defaultConfig;
};

const getMjmlConfigurationById =
  (mjmlConfig: MjmlConfig | null | undefined) => (configurationId?: string) => {
    if (!configurationId?.length) {
      return getDefaultEmptyMjmlConfiguration();
    }
    const existingConfig = mjmlConfig?.availableConfigurations[configurationId];
    if (!existingConfig) {
      return getDefaultEmptyMjmlConfiguration();
    }
    return existingConfig;
  };

const setMjmlConfigurationById =
  (mjmlConfig: MjmlConfig | null | undefined) =>
  (configurationId: string | undefined) =>
  (mjmlConfiguration: MjmlConfiguration) => {
    const mjmlConfigNormalized = structuredClone(mjmlConfig) ?? { availableConfigurations: {} };

    // for creating a new configurations, the ID has to be generated
    const id = configurationId || Date.now();
    mjmlConfigNormalized.availableConfigurations[id] ??= getDefaultEmptyMjmlConfiguration();

    mjmlConfigNormalized.availableConfigurations[id] = mjmlConfiguration;

    return mjmlConfigNormalized;
  };

export const MjmlConfigContainer = {
  getMjmlConfigurationById,
  setMjmlConfigurationById,
};
