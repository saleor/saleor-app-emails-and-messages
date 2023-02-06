import { AuthData } from "@saleor/app-sdk/APL";
import { appRouter } from "../../modules/trpc/trpc-app-router";

interface GetMjmlSettingsArgs {
  authData: AuthData;
  channel: string;
}

export const getMjmlSettings = async ({ authData, channel }: GetMjmlSettingsArgs) => {
  const caller = appRouter.createCaller({
    appId: authData.appId,
    saleorApiUrl: authData.saleorApiUrl,
    token: authData.token,
    ssr: true,
  });

  const configurations = await caller.mjmlConfiguration.fetch();

  const configuration = configurations.shopConfigPerChannel[channel];

  //TODO: validate the config
  // const storefrontUrl = configuration.mjmlConfiguration.storefrontUrl;

  // const productStorefrontUrl = configuration.urlConfiguration.productStorefrontUrl;

  // if (!storefrontUrl.length || !productStorefrontUrl.length) {
  //   throw new Error("The application has not been configured");
  // }

  return configuration.mjmlConfiguration;
};
