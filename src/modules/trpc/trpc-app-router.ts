import { channelsRouter } from "../channels/channels.router";
import { router } from "./trpc-server";
import { appConfigurationRouter } from "../app-configuration/app-configuration.router";
import { mjmlConfigurationRouter } from "../mjml/configuration/mjml-configuration.router";

export const appRouter = router({
  channels: channelsRouter,
  appConfiguration: appConfigurationRouter,
  mjmlConfiguration: mjmlConfigurationRouter,
});

export type AppRouter = typeof appRouter;
