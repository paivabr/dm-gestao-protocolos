import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Plus, Trash2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Calendario() {
  const { user } = useAuth();
  const { data: permissions } = trpc.permissions.getMyPermissions.useQuery();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 15)); // Abril 15, 2026
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    informacoesAdicionais: "",
  });

  const { data: servicos = [], refetch } = trpc.calendario.getByUsuario.useQuery();
  const createMutation = trpc.calendario.create.useMutation({
    onSuccess: () => {
      refetch();
      setFormData({ titulo: "", descricao: "", informacoesAdicionais: "" });
      setShowForm(false);
    },
  });
  const deleteMutation = trpc.calendario.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const servicosByDate = useMemo(() => {
    const map: Record<string, typeof servicos> = {};
    servicos.forEach((servico) => {
      const dateStr = new Date(servico.data).toLocaleDateString("pt-BR");
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(servico);
    });
    return map;
  }, [servicos]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(date);
  };

  const handleAddServico = async () => {
    if (!selectedDate || !formData.titulo) return;
    await createMutation.mutateAsync({
      titulo: formData.titulo,
      descricao: formData.descricao,
      data: selectedDate,
      informacoesAdicionais: formData.informacoesAdicionais,
    });
  };

  const handleDeleteServico = async (id: number) => {
    await deleteMutation.mutateAsync({ id });
  };

  const selectedDateStr = selectedDate?.toLocaleDateString("pt-BR");
  const selectedServicos = selectedDateStr ? servicosByDate[selectedDateStr] || [] : [];

  const monthName = currentDate.toLocaleString("pt-BR", { month: "long", year: "numeric" });

  // Bloquear acesso se não tem permissão
  if (user?.role !== "admin" && !permissions?.canViewCalendar) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              Acesso Negado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">Você não tem permissão para acessar esta página. Solicite ao administrador.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Calendário de Serviços</h1>
        <p className="text-gray-600 mt-2">Marque seus serviços e acompanhe as datas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="capitalize">{monthName}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Dias da semana */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
                <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Dias do mês */}
            <div className="grid grid-cols-7 gap-2">
              {/* Espaços vazios antes do primeiro dia */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Dias do mês */}
              {days.map((day) => {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const dateStr = date.toLocaleDateString("pt-BR");
                const hasServicos = servicosByDate[dateStr] && servicosByDate[dateStr].length > 0;
                const isSelected = selectedDate?.toLocaleDateString("pt-BR") === dateStr;

                return (
                  <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`
                      aspect-square rounded-lg border-2 p-2 text-sm font-medium transition-colors
                      ${hasServicos ? "bg-blue-100 border-blue-500" : "border-gray-200"}
                      ${isSelected ? "ring-2 ring-blue-600 ring-offset-2" : ""}
                      hover:border-blue-400
                    `}
                  >
                    <div className="text-gray-900">{day}</div>
                    {hasServicos && (
                      <div className="text-xs text-blue-600 font-semibold mt-1">
                        {servicosByDate[dateStr].length} serviço{servicosByDate[dateStr].length > 1 ? "s" : ""}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Painel de detalhes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate ? selectedDate.toLocaleDateString("pt-BR") : "Selecione uma data"}
            </CardTitle>
            <CardDescription>Informações do serviço</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedDate && (
              <>
                {/* Formulário para adicionar serviço */}
                {showForm ? (
                  <div className="space-y-3 border-b pb-4">
                    <Input
                      placeholder="Título do serviço"
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    />
                    <Textarea
                      placeholder="Descrição (opcional)"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      rows={2}
                    />
                    <Textarea
                      placeholder="Informações adicionais (opcional)"
                      value={formData.informacoesAdicionais}
                      onChange={(e) =>
                        setFormData({ ...formData, informacoesAdicionais: e.target.value })
                      }
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleAddServico}
                        disabled={createMutation.isPending}
                      >
                        Salvar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowForm(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => setShowForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Serviço
                  </Button>
                )}

                {/* Lista de serviços */}
                <div className="space-y-3">
                  {selectedServicos.length > 0 ? (
                    selectedServicos.map((servico) => (
                      <div
                        key={servico.id}
                        className="bg-blue-50 border border-blue-200 rounded-lg p-3"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{servico.titulo}</h4>
                            {servico.descricao && (
                              <p className="text-sm text-gray-600 mt-1">{servico.descricao}</p>
                            )}
                            {servico.informacoesAdicionais && (
                              <div className="text-sm text-gray-700 mt-2 bg-white p-2 rounded border border-blue-100">
                                <strong>Informações:</strong> {servico.informacoesAdicionais}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteServico(servico.id)}
                            disabled={deleteMutation.isPending}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhum serviço marcado para esta data
                    </p>
                  )}
                </div>
              </>
            )}

            {!selectedDate && (
              <p className="text-sm text-gray-500 text-center py-8">
                Clique em uma data no calendário para adicionar serviços
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
