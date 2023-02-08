import { PrivateMetadataSendgridConfigurator } from "./sendgrid-configurator";
import { FallbackSendgridConfig } from "./fallback-sendgrid-config";
import { Client } from "urql";
import { logger as pinoLogger } from "../../../lib/logger";
import { createSettingsManager } from "../../app-configuration/metadata-manager";
import { ChannelsFetcher } from "../../channels/channels-fetcher";
import { ShopInfoFetcher } from "../../shop-info/shop-info-fetcher";

// todo test
export class GetSendgridConfigurationService {
  constructor(
    private settings: {
      apiClient: Client;
      saleorApiUrl: string;
    }
  ) {}

  async getConfiguration() {
    const logger = pinoLogger.child({
      service: "GetSendgridConfigurationService",
      saleorApiUrl: this.settings.saleorApiUrl,
    });

    const { saleorApiUrl, apiClient } = this.settings;

    const sendgridConfigurator = new PrivateMetadataSendgridConfigurator(
      createSettingsManager(apiClient),
      saleorApiUrl
    );

    const savedSendgridConfig = (await sendgridConfigurator.getConfig()) ?? null;

    logger.debug(savedSendgridConfig, "Retrieved sendgrid config from Metadata. Will return it");

    if (savedSendgridConfig) {
      return savedSendgridConfig;
    }

    logger.info("Sendgrid config not found in metadata. Will create default config now.");

    const channelsFetcher = new ChannelsFetcher(apiClient);
    const shopInfoFetcher = new ShopInfoFetcher(apiClient);

    const [channels, shopSendgridConfiguration] = await Promise.all([
      channelsFetcher.fetchChannels(),
      shopInfoFetcher.fetchShopInfo(),
    ]);

    logger.debug(channels, "Fetched channels");
    logger.debug(shopSendgridConfiguration, "Fetched shop sendgrid configuration");

    const sendgridConfig = FallbackSendgridConfig.createFallbackConfigFromExistingShopAndChannels(
      channels ?? [],
      shopSendgridConfiguration
    );

    logger.debug(sendgridConfig, "Created a fallback SendgridConfig. Will save it.");

    await sendgridConfigurator.setConfig(sendgridConfig);

    logger.info("Saved initial SendgridConfig");

    return sendgridConfig;
  }
}
