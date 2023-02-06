import { PrivateMetadataMjmlConfigurator } from "./mjml-configurator";
import { logger as pinoLogger } from "../../../lib/logger";
import { mjmlConfigInputSchema } from "./mjml-config-input-schema";
import { GetMjmlConfigurationService } from "./get-mjml-configuration.service";
import { router } from "../../trpc/trpc-server";
import { protectedClientProcedure } from "../../trpc/protected-client-procedure";
import { createSettingsManager } from "../../app-configuration/metadata-manager";

export const mjmlConfigurationRouter = router({
  fetch: protectedClientProcedure.query(async ({ ctx, input }) => {
    const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });

    logger.debug("mjmlConfigurationRouter.fetch called");

    return new GetMjmlConfigurationService({
      apiClient: ctx.apiClient,
      saleorApiUrl: ctx.saleorApiUrl,
    }).getConfiguration();
  }),
  setAndReplace: protectedClientProcedure
    // TODO: Update the permissions required to change the mjml settings
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(mjmlConfigInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "mjmlConfigurationRouter.setAndReplace called with input");

      const mjmlConfigurator = new PrivateMetadataMjmlConfigurator(
        createSettingsManager(ctx.apiClient),
        ctx.saleorApiUrl
      );

      await mjmlConfigurator.setConfig(input);

      return null;
    }),
});
