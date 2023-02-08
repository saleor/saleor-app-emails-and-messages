import { z } from "zod";

export const sendgridConfigInputSchema = z.object({
  shopConfigPerChannel: z.record(
    z.object({
      sendgridConfiguration: z.object({
        active: z.boolean(),
        sandboxMode: z.boolean(),
        senderName: z.string().min(0),
        senderEmail: z.string().min(0),
        apiKey: z.string().min(0),
        templateOrderCreatedSubject: z.string().min(0),
        templateOrderCreatedTemplate: z.string().min(0),
        templateOrderFulfilledSubject: z.string().min(0),
        templateOrderFulfilledTemplate: z.string().min(0),
      }),
    })
  ),
});
