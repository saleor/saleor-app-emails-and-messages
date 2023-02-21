import { AuthData } from "@saleor/app-sdk/APL";
import { appRouter } from "../trpc/trpc-app-router";
import { logger as pinoLogger } from "../../lib/logger";

interface GetMjmlSettingsArgs {
  authData: AuthData;
  channel: string;
}

export const getActiveMjmlSettings = async ({ authData, channel }: GetMjmlSettingsArgs) => {
  const logger = pinoLogger.child({
    fn: "getMjmlSettings",
    channel,
  });

  const caller = appRouter.createCaller({
    appId: authData.appId,
    saleorApiUrl: authData.saleorApiUrl,
    token: authData.token,
    ssr: true,
  });

  const mjmlConfigurations = await caller.mjmlConfiguration.fetch();
  const appConfigurations = await caller.appConfiguration.fetch();

  const channelAppConfiguration = appConfigurations.configurationsPerChannel[channel];
  if (!channelAppConfiguration) {
    logger.warn("App has no configuration for this channel");
    return;
  }

  if (!channelAppConfiguration.active) {
    logger.warn("App configuration is not active for this channel");
    return;
  }

  const mjmlConfigurationId = channelAppConfiguration.mjmlConfigurationId;
  if (!mjmlConfigurationId?.length) {
    logger.warn("MJML configuration has not been chosen for this channel");
    return;
  }

  const configuration = mjmlConfigurations?.availableConfigurations[mjmlConfigurationId];
  if (!configuration) {
    logger.warn(`The MJML configuration with id ${mjmlConfigurationId} does not exist`);
    return;
  }

  if (!configuration.active) {
    logger.warn(`The MJML configuration ${configuration.configurationName} is not active`);
    return;
  }

  //TODO: validate the config
  // const storefrontUrl = configuration.mjmlConfiguration.storefrontUrl;

  // const productStorefrontUrl = configuration.urlConfiguration.productStorefrontUrl;

  // if (!storefrontUrl.length || !productStorefrontUrl.length) {
  //   throw new Error("The application has not been configured");
  // }

  return configuration;
};
