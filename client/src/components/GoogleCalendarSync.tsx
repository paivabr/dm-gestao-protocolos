import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Loader2, Check, AlertCircle } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface GoogleCalendarSyncProps {
  calendarioId: number;
  titulo: string;
  descricao?: string;
  data: Date;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function GoogleCalendarSync({
  calendarioId,
  titulo,
  descricao,
  data,
  open,
  onOpenChange,
  onSuccess,
}: GoogleCalendarSyncProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const syncEvent = trpc.googleCalendar.syncEvent.useMutation();

  const handleSync = async () => {
    try {
      setIsLoading(true);
      setStatus("idle");

      await syncEvent.mutateAsync({
        calendarioId,
        titulo,
        descricao,
        data,
      });

      setStatus("success");
      toast.success("Evento sincronizado com Google Calendar!");
      onSuccess?.();

      setTimeout(() => {
        onOpenChange(false);
        setStatus("idle");
      }, 2000);
    } catch (error) {
      console.error("Error syncing event:", error);
      setStatus("error");
      toast.error("Falha ao sincronizar com Google Calendar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Sincronizar com Google Calendar
          </DialogTitle>
          <DialogDescription>
            Deseja sincronizar este evento com seu Google Calendar?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div>
              <p className="text-sm font-medium text-gray-600">Evento</p>
              <p className="text-gray-900">{titulo}</p>
            </div>
            {descricao && (
              <div>
                <p className="text-sm font-medium text-gray-600">Descrição</p>
                <p className="text-gray-900 text-sm">{descricao}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-600">Data/Hora</p>
              <p className="text-gray-900">{new Date(data).toLocaleString("pt-BR")}</p>
            </div>
          </div>

          {status === "success" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600" />
              <p className="text-green-800">Evento sincronizado com sucesso!</p>
            </div>
          )}

          {status === "error" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">Falha ao sincronizar. Verifique se você autorizou o Google Calendar.</p>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSync}
              disabled={isLoading || status === "success"}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sincronizando...
                </>
              ) : status === "success" ? (
                <>
                  <Check className="h-4 w-4" />
                  Sincronizado
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
                  Sincronizar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
