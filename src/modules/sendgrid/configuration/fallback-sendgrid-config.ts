import { ChannelFragment, ShopInfoFragment } from "../../../../generated/graphql";
import { SendgridConfig as SendgridConfig } from "./sendgrid-config";
import {
  getDefaultEmptySendgridConfiguration,
  SendgridConfigContainer as SendgridConfigContainer,
} from "./sendgrid-config-container";

/**
 * TODO Test
 */
export const FallbackSendgridConfig = {
  createFallbackConfigFromExistingShopAndChannels(
    channels: ChannelFragment[],
    shopSendgridConfiguration: ShopInfoFragment | null
  ) {
    return (channels ?? []).reduce<SendgridConfig>(
      (state, channel) => {
        return SendgridConfigContainer.setChannelSendgridConfiguration(state)(channel.slug)(
          getDefaultEmptySendgridConfiguration()
        );
      },
      { shopConfigPerChannel: {} }
    );
  },
};
