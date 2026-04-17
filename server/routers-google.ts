import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import * as googleCalendar from "./google-calendar";

export const googleCalendarRouter = router({
  getAuthUrl: protectedProcedure
    .query(({ ctx }) => {
      if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
      const url = googleCalendar.getGoogleAuthUrl(ctx.user.id);
      return { url };
    }),

  syncEvent: protectedProcedure
    .input(z.object({
      calendarioId: z.number(),
      titulo: z.string(),
      descricao: z.string().optional(),
      data: z.date(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
      
      // Obter tokens do usuário
      const tokens = await db.getGoogleCalendarTokens(ctx.user.id);
      if (!tokens?.googleAccessToken) {
        throw new TRPCError({ 
          code: "UNAUTHORIZED", 
          message: "Usuário não autorizou acesso ao Google Calendar" 
        });
      }

      try {
        // Criar evento no Google Calendar
        const event = await googleCalendar.createGoogleCalendarEvent(
          tokens.googleAccessToken,
          {
            title: input.titulo,
            description: input.descricao,
            startTime: input.data,
          }
        );

        // Salvar referência do evento no banco
        await db.updateCalendarioWithGoogleEvent(input.calendarioId, event.id!);

        return { success: true, googleEventId: event.id };
      } catch (error) {
        console.error("Failed to sync event with Google Calendar:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Falha ao sincronizar com Google Calendar",
        });
      }
    }),

  deleteEvent: protectedProcedure
    .input(z.object({
      calendarioId: z.number(),
      googleEventId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });

      const tokens = await db.getGoogleCalendarTokens(ctx.user.id);
      if (!tokens?.googleAccessToken) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        await googleCalendar.deleteGoogleCalendarEvent(
          tokens.googleAccessToken,
          input.googleEventId
        );
        return { success: true };
      } catch (error) {
        console.error("Failed to delete event from Google Calendar:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Falha ao deletar evento do Google Calendar",
        });
      }
    }),
});
