import { AuthData } from "@saleor/app-sdk/APL";
import { appRouter } from "../trpc/trpc-app-router";

interface GetSendgridSettingsArgs {
  authData: AuthData;
  channel: string;
}

export const getSendgridSettings = async ({ authData, channel }: GetSendgridSettingsArgs) => {
  const caller = appRouter.createCaller({
    appId: authData.appId,
    saleorApiUrl: authData.saleorApiUrl,
    token: authData.token,
    ssr: true,
  });

  const configurations = await caller.sendgridConfiguration.fetch();

  const configuration = configurations.shopConfigPerChannel[channel];

  return configuration.sendgridConfiguration;
};
