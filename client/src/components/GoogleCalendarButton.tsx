import { Button } from "@/components/ui/button";
import { Calendar, Loader2 } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface GoogleCalendarButtonProps {
  onConnected?: () => void;
}

export function GoogleCalendarButton({ onConnected }: GoogleCalendarButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const getAuthUrl = trpc.googleCalendar.getAuthUrl.useQuery(
    undefined,
    { enabled: false }
  );

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      const result = await getAuthUrl.refetch();
      
      if (result.data?.url) {
        // Abrir janela de autorização do Google
        const width = 500;
        const height = 600;
        const left = window.innerWidth / 2 - width / 2;
        const top = window.innerHeight / 2 - height / 2;
        
        const popup = window.open(
          result.data.url,
          'Google Calendar Authorization',
          `width=${width},height=${height},left=${left},top=${top}`
        );

        // Verificar se a autorização foi concluída
        if (popup) {
          const checkPopup = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkPopup);
              setIsLoading(false);
              toast.success("Google Calendar conectado com sucesso!");
              onConnected?.();
            }
          }, 1000);
        }
      } else {
        toast.error("Falha ao obter URL de autorização");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error connecting to Google Calendar:", error);
      toast.error("Erro ao conectar com Google Calendar");
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleConnect}
      disabled={isLoading}
      variant="outline"
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Calendar className="h-4 w-4" />
      )}
      {isLoading ? "Conectando..." : "Conectar Google Calendar"}
    </Button>
  );
}
