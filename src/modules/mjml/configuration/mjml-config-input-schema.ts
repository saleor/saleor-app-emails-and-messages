import { z } from "zod";

export const mjmlConfigInputSchema = z.object({
  shopConfigPerChannel: z.record(
    z.object({
      mjmlConfiguration: z.object({
        active: z.boolean(),
        senderName: z.string().min(0),
        senderEmail: z.string().min(0),
        smtpHost: z.string().min(0),
        smtpPort: z.string().min(0),
        smtpUser: z.string().min(0),
        useTls: z.boolean(),
        useSsl: z.boolean(),
        templateOrderCreatedSubject: z.string().min(0),
        templateOrderCreatedTemplate: z.string().min(0),
        templateOrderFulfilledSubject: z.string().min(0),
        templateOrderFulfilledTemplate: z.string().min(0),
      }),
    })
  ),
});
