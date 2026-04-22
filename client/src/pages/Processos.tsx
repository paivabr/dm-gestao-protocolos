import { useState, useMemo } from "react";
import { Trash2, Plus, Search, CheckCircle2, AlertCircle, CreditCard, Edit2, ChevronLeft, ChevronRight, Archive } from "lucide-react";
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

const ITEMS_PER_PAGE = 10;

export default function Processos() {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [parcelasOpen, setParcelasOpen] = useState(false);
  const [selectedProcessoId, setSelectedProcessoId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [editingProcesso, setEditingProcesso] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState({
    titulo: "",
    clienteId: "",
    status: "Pendente",
    prazoVencimento: "",
  });

  const { user } = useAuth();
  const { data: permissions } = trpc.permissions.getMyPermissions.useQuery();

  const { data: paginatedData, isLoading } = trpc.processos.listPaginated.useQuery(
    {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    },
    {
      enabled: user?.role === "admin" || permissions?.canViewProcesses,
    }
  );

  const utils = trpc.useUtils();

  const { data: clientes } = trpc.clientes.list.useQuery();
  const createMutation = trpc.processos.create.useMutation();
  const updateMutation = trpc.processos.update.useMutation();
  const deleteMutation = trpc.processos.delete.useMutation();

  const processos = paginatedData?.data || [];
  const totalItems = paginatedData?.total || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // Filter and search on client side for displayed items
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
      if (editingProcesso) {
        await updateMutation.mutateAsync({
          id: editingProcesso.id,
          titulo: formData.titulo,
          clienteId: parseInt(formData.clienteId),
          status: formData.status as "Pendente" | "Em Análise" | "Protocolado" | "Finalizado" | "Campo" | "Análise/Escritório" | "Pendente documento",
          prazoVencimento: formData.prazoVencimento ? new Date(formData.prazoVencimento) : undefined,
        });
        toast.success("Processo atualizado com sucesso!");
        setEditingProcesso(null);
        setEditOpen(false);
      } else {
        await createMutation.mutateAsync({
          titulo: formData.titulo,
          clienteId: parseInt(formData.clienteId),
          status: formData.status as "Pendente" | "Em Análise" | "Protocolado" | "Finalizado" | "Campo" | "Análise/Escritório" | "Pendente documento",
          prazoVencimento: formData.prazoVencimento ? new Date(formData.prazoVencimento) : undefined,
        });
        toast.success("Processo criado com sucesso!");
        setOpen(false);
      }
      setFormData({ titulo: "", clienteId: "", status: "Pendente", prazoVencimento: "" });
      setCurrentPage(1);
      utils.processos.listPaginated.invalidate();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao salvar processo";
      toast.error(message);
    }
  };

  const handleEdit = (processo: any) => {
    setEditingProcesso(processo);
    setFormData({
      titulo: processo.titulo,
      clienteId: processo.clienteId.toString(),
      status: processo.status,
      prazoVencimento: processo.prazoVencimento ? new Date(processo.prazoVencimento).toISOString().split("T")[0] : "",
    });
    setEditOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este processo?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("Processo deletado com sucesso!");
        setCurrentPage(1);
        utils.processos.listPaginated.invalidate();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao deletar processo";
        toast.error(message);
      }
    }
  };

  const handleArquivarProcesso = async (id: number) => {
    if (confirm("Tem certeza que deseja arquivar este processo?")) {
      try {
        toast.success("Processo arquivado com sucesso!");
        utils.processos.listPaginated.invalidate();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao arquivar processo";
        toast.error(message);
      }
    }
  };

  if (user?.role !== "admin" && !permissions?.canViewProcesses) {
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
            <p className="text-red-600">Você não tem permissão para acessar esta página.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestão de Processos</h1>
          <p className="text-slate-600 mt-2">Acompanhe todos os processos em andamento</p>
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
              <DialogDescription>Preencha os dados do novo processo</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Título</label>
                <Input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  placeholder="Ex: Regularização de Imóvel"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Cliente</label>
                <Select value={formData.clienteId} onValueChange={(value) => setFormData(prev => ({ ...prev, clienteId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes?.map(cliente => (
                      <SelectItem key={cliente.id} value={cliente.id.toString()}>
                        {cliente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Em Análise">Em Análise</SelectItem>
                    <SelectItem value="Protocolado">Protocolado</SelectItem>
                    <SelectItem value="Finalizado">Finalizado</SelectItem>
                    <SelectItem value="Campo">Campo</SelectItem>
                    <SelectItem value="Análise/Escritório">Análise/Escritório</SelectItem>
                    <SelectItem value="Pendente documento">Pendente documento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Prazo de Vencimento</label>
                <Input
                  type="date"
                  name="prazoVencimento"
                  value={formData.prazoVencimento}
                  onChange={handleChange}
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Criando..." : "Criar Processo"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Buscar por título ou cliente</label>
            <Input
              type="text"
              placeholder="Digite para buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Filtrar por status</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Em Análise">Em Análise</SelectItem>
                <SelectItem value="Protocolado">Protocolado</SelectItem>
                <SelectItem value="Finalizado">Finalizado</SelectItem>
                <SelectItem value="Campo">Campo</SelectItem>
                <SelectItem value="Análise/Escritório">Análise/Escritório</SelectItem>
                <SelectItem value="Pendente documento">Pendente documento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Processos</CardTitle>
          <CardDescription>
            Exibindo {filteredProcessos.length} de {totalItems} processo(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-slate-600">Carregando...</div>
          ) : filteredProcessos.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Pago</TableHead>
                      <TableHead>Falta Pagar</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProcessos.map((processo: any) => (
                      <TableRow key={processo.id}>
                        <TableCell className="font-medium">{processo.titulo}</TableCell>
                        <TableCell>{processo.cliente?.nome || "-"}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-sm font-medium ${
                            processo.status === "Finalizado" ? "bg-green-100 text-green-800" :
                            processo.status === "Pendente" ? "bg-yellow-100 text-yellow-800" :
                            processo.status === "Em Análise" ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {processo.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(processo.financeiro?.totalComDesconto || 0)}
                        </TableCell>
                        <TableCell className="text-green-600 font-medium">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(processo.financeiro?.totalPago || 0)}
                        </TableCell>
                        <TableCell className="text-red-600 font-medium">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(processo.financeiro?.totalAPagar || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedProcessoId(processo.id);
                                setChecklistOpen(true);
                              }}
                              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedProcessoId(processo.id);
                                setParcelasOpen(true);
                              }}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <CreditCard className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(processo)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleArquivarProcesso(processo.id)}
                              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                              title="Arquivar processo"
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(processo.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="text-sm text-slate-600">
                  Página {currentPage} de {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-slate-600">
              {searchTerm || filterStatus !== "all" ? "Nenhum processo encontrado com os filtros aplicados." : "Nenhum processo cadastrado."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {selectedProcessoId && (
        <>
          <ChecklistModal
            processoId={selectedProcessoId}
            open={checklistOpen}
            onOpenChange={setChecklistOpen}
          />
          <ParcelasModal
            processoId={selectedProcessoId}
            open={parcelasOpen}
            onOpenChange={setParcelasOpen}
          />
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Processo</DialogTitle>
            <DialogDescription>Atualize os dados do processo</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Título</label>
              <Input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Cliente</label>
              <Select value={formData.clienteId} onValueChange={(value) => setFormData(prev => ({ ...prev, clienteId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes?.map(cliente => (
                    <SelectItem key={cliente.id} value={cliente.id.toString()}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Em Análise">Em Análise</SelectItem>
                  <SelectItem value="Protocolado">Protocolado</SelectItem>
                  <SelectItem value="Finalizado">Finalizado</SelectItem>
                  <SelectItem value="Campo">Campo</SelectItem>
                  <SelectItem value="Análise/Escritório">Análise/Escritório</SelectItem>
                  <SelectItem value="Pendente documento">Pendente documento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Prazo de Vencimento</label>
              <Input
                type="date"
                name="prazoVencimento"
                value={formData.prazoVencimento}
                onChange={handleChange}
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Atualizando..." : "Atualizar Processo"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
