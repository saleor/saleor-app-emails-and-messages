import { PrivateMetadataMjmlConfigurator } from "./mjml-configurator";
import { FallbackMjmlConfig } from "./fallback-mjml-config";
import { Client } from "urql";
import { logger as pinoLogger } from "../../../lib/logger";
import { createSettingsManager } from "../../app-configuration/metadata-manager";
import { ChannelsFetcher } from "../../channels/channels-fetcher";
import { ShopInfoFetcher } from "../../shop-info/shop-info-fetcher";

// todo test
export class GetMjmlConfigurationService {
  constructor(
    private settings: {
      apiClient: Client;
      saleorApiUrl: string;
    }
  ) {}

  async getConfiguration() {
    const logger = pinoLogger.child({
      service: "GetMjmlConfigurationService",
      saleorApiUrl: this.settings.saleorApiUrl,
    });

    const { saleorApiUrl, apiClient } = this.settings;

    const mjmlConfigurator = new PrivateMetadataMjmlConfigurator(
      createSettingsManager(apiClient),
      saleorApiUrl
    );

    const savedMjmlConfig = (await mjmlConfigurator.getConfig()) ?? null;

    logger.debug(savedMjmlConfig, "Retrieved mjml config from Metadata. Will return it");

    if (savedMjmlConfig) {
      return savedMjmlConfig;
    }

    logger.info("Mjml config not found in metadata. Will create default config now.");

    const channelsFetcher = new ChannelsFetcher(apiClient);
    const shopInfoFetcher = new ShopInfoFetcher(apiClient);

    const [channels, shopMjmlConfiguration] = await Promise.all([
      channelsFetcher.fetchChannels(),
      shopInfoFetcher.fetchShopInfo(),
    ]);

    logger.debug(channels, "Fetched channels");
    logger.debug(shopMjmlConfiguration, "Fetched shop mjml configuration");

    const mjmlConfig = FallbackMjmlConfig.createFallbackConfigFromExistingShopAndChannels(
      channels ?? [],
      shopMjmlConfiguration
    );

    logger.debug(mjmlConfig, "Created a fallback MjmlConfig. Will save it.");

    await mjmlConfigurator.setConfig(mjmlConfig);

    logger.info("Saved initial MjmlConfig");

    return mjmlConfig;
  }
}
