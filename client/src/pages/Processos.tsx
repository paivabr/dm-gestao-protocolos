import { useState, useMemo } from "react";
import { Trash2, Plus, Search, CheckCircle2, AlertCircle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import ChecklistModal from "@/components/ChecklistModal";
import ParcelasModal from "@/components/ParcelasModal";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Processos() {
  const [open, setOpen] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [parcelasOpen, setParcelasOpen] = useState(false);
  const [selectedProcessoId, setSelectedProcessoId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [formData, setFormData] = useState({
    titulo: "",
    clienteId: "",
    status: "Pendente",
    prazoVencimento: "",
  });

  const { user } = useAuth();
  const { data: permissions } = trpc.permissions.getMyPermissions.useQuery();

  const { data: processos, isLoading, refetch } = trpc.processos.list.useQuery(undefined, {
    enabled: user?.role === "admin" || permissions?.canViewProcesses,
  });
  const { data: clientes } = trpc.clientes.list.useQuery();
  const createMutation = trpc.processos.create.useMutation();
  const deleteMutation = trpc.processos.delete.useMutation();

  // Filter and search
  const filteredProcessos = useMemo(() => {
    if (!processos) return [];

    return processos.filter(p => {
      const matchesSearch =
        p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || p.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [processos, searchTerm, filterStatus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        titulo: formData.titulo,
        clienteId: parseInt(formData.clienteId),
        status: formData.status as "Pendente" | "Em Análise" | "Protocolado" | "Finalizado",
        prazoVencimento: formData.prazoVencimento ? new Date(formData.prazoVencimento) : undefined,
      });
      toast.success("Processo criado com sucesso!");
      setFormData({ titulo: "", clienteId: "", status: "Pendente", prazoVencimento: "" });
      setOpen(false);
      refetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao criar processo";
      toast.error(message);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este processo?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("Processo deletado com sucesso!");
        refetch();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao deletar processo";
        toast.error(message);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pendente":
        return "bg-orange-100 text-orange-800";
      case "Em Análise":
        return "bg-blue-100 text-blue-800";
      case "Protocolado":
        return "bg-purple-100 text-purple-800";
      case "Finalizado":
        return "bg-green-100 text-green-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const isVencido = (prazo: Date | null) => {
    if (!prazo) return false;
    return new Date(prazo) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestão de Processos</h1>
          <p className="text-slate-600 mt-2">Controle o fluxo de processos imobiliários</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Processo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Processo</DialogTitle>
              <DialogDescription>
                Preencha os dados para criar um novo processo de regularização
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Título do Processo
                </label>
                <Input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  placeholder="Ex: Registro de Compra e Venda"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cliente
                </label>
                <select
                  name="clienteId"
                  value={formData.clienteId}
                  onChange={e => setFormData(prev => ({ ...prev, clienteId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {clientes?.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Em Análise">Em Análise</option>
                  <option value="Protocolado">Protocolado</option>
                  <option value="Finalizado">Finalizado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Prazo de Vencimento
                </label>
                <Input
                  type="date"
                  name="prazoVencimento"
                  value={formData.prazoVencimento}
                  onChange={handleChange}
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Criar Processo
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Buscar por título ou cliente..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md"
            >
              <option value="all">Todos os Status</option>
              <option value="Pendente">Pendente</option>
              <option value="Em Análise">Em Análise</option>
              <option value="Protocolado">Protocolado</option>
              <option value="Finalizado">Finalizado</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Processos</CardTitle>
          <CardDescription>
            Total de {filteredProcessos.length} processo(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-slate-600">Carregando...</div>
          ) : filteredProcessos.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProcessos.map(processo => (
                    <TableRow key={processo.id}>
                      <TableCell className="font-medium">{processo.titulo}</TableCell>
                      <TableCell>{processo.cliente?.nome || "-"}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(processo.status)}`}>
                          {processo.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {processo.prazoVencimento ? (
                          <div className="flex items-center gap-2">
                            {isVencido(processo.prazoVencimento) && (
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            )}
                            {new Date(processo.prazoVencimento).toLocaleDateString("pt-BR")}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedProcessoId(processo.id);
                            setParcelasOpen(true);
                          }}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          title="Gerenciar parcelas"
                        >
                          <CreditCard className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedProcessoId(processo.id);
                            setChecklistOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(processo.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-600">
              Nenhum processo encontrado. Clique em "Novo Processo" para começar.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parcelas Modal */}
      {selectedProcessoId && (
        <ParcelasModal
          processoId={selectedProcessoId}
          open={parcelasOpen}
          onOpenChange={setParcelasOpen}
        />
      )}

      {/* Checklist Modal */}
      {selectedProcessoId && (
        <ChecklistModal
          processoId={selectedProcessoId}
          open={checklistOpen}
          onOpenChange={setChecklistOpen}
          processo={filteredProcessos.find(p => p.id === selectedProcessoId)}
        />
      )}
    </div>
  );
}
