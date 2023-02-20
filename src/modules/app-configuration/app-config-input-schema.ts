import { z } from "zod";

export const appConfigInputSchema = z.object({
  shopConfigPerChannel: z.record(
    z.object({
      appConfiguration: z.object({
        active: z.boolean(),
        mjmlConfigurationId: z.string().optional(),
        sendgridConfigurationId: z.string().optional(),
      }),
    })
  ),
});
