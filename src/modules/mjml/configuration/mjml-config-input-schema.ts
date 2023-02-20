import { z } from "zod";

export const mjmlConfigInputSchema = z.object({
  availableConfigurations: z.record(
    z.object({
      active: z.boolean(),
      configurationName: z.string(),
      senderName: z.string(),
      senderEmail: z.string(),
      smtpHost: z.string(),
      smtpPort: z.string(),
      smtpUser: z.string().min(0),
      useTls: z.boolean(),
      useSsl: z.boolean(),
      templateInvoiceSentSubject: z.string(),
      templateInvoiceSentTemplate: z.string(),
      templateOrderCancelledSubject: z.string(),
      templateOrderCancelledTemplate: z.string(),
      templateOrderConfirmedSubject: z.string(),
      templateOrderConfirmedTemplate: z.string(),
      templateOrderFullyPaidSubject: z.string(),
      templateOrderFullyPaidTemplate: z.string(),
      templateOrderCreatedSubject: z.string(),
      templateOrderCreatedTemplate: z.string(),
      templateOrderFulfilledSubject: z.string(),
      templateOrderFulfilledTemplate: z.string(),
    })
  ),
});
