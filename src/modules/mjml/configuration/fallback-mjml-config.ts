import { ChannelFragment, ShopInfoFragment } from "../../../../generated/graphql";
import { MjmlConfig } from "./mjml-config";
import { getDefaultEmptyMjmlConfiguration, MjmlConfigContainer } from "./mjml-config-container";

/**
 * TODO Test
 */
export const FallbackMjmlConfig = {
  createFallbackConfigFromExistingShopAndChannels(
    channels: ChannelFragment[],
    shopMjmlConfiguration: ShopInfoFragment | null
  ) {
    return (channels ?? []).reduce<MjmlConfig>(
      (state, channel) => {
        return MjmlConfigContainer.setChannelMjmlConfiguration(state)(channel.slug)(
          getDefaultEmptyMjmlConfiguration()
        );
      },
      { shopConfigPerChannel: {} }
    );
  },
};
