
import { useState, useMemo } from "react";
import { Plus, Search, Edit2, Trash2, Filter, X, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select-no-portal";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

export default function StatusProtocolo() {
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();
  const { data: permissions } = trpc.permissions.getMyPermissions.useQuery();
  const { data: paginatedData, isLoading, refetch } = trpc.statusProtocolo.listPaginated.useQuery({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });
  const { data: clientes = [] } = trpc.clientes.list.useQuery();
  const createMutation = trpc.statusProtocolo.create.useMutation();
  const updateMutation = trpc.statusProtocolo.update.useMutation();
  const deleteMutation = trpc.statusProtocolo.delete.useMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchProtocolo, setSearchProtocolo] = useState("");
  const [searchCliente, setSearchCliente] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCartorio, setFilterCartorio] = useState("");
  
  // Estados para tipos de processo e cartórios dinâmicos
  const [tiposProcesso, setTiposProcesso] = useState([
    "Georreferenciamento",
    "Certidão de Localização",
    "Averbação de Qualificação",
  ]);
  const [cartorios, setCartorios] = useState([
    "Colatina",
    "Santa Teresa",
    "Linares",
    "João Neiva",
    "Marialândia",
  ]);
  
  const [novoTipo, setNovoTipo] = useState("");
  const [novoCartorio, setNovoCartorio] = useState("");

  const [formData, setFormData] = useState({
    clienteId: "",
    numeroProtocolo: "",
    tipoProcesso: "",
    dataAbertura: new Date().toISOString().split("T")[0],
    status: "Pronto",
    cartorio: "",
    observacoes: "",
  });

  const STATUS_OPTIONS = ["Pronto", "Reingressado", "Reingressado pós pagamento", "Nota de Pagamento", "Exigência", "Protocolado", "Vencido", "Campo", "Análise/Escritório", "Pendente documento"];

  const protocolos = paginatedData?.data || [];
  const totalItems = paginatedData?.total || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // Ordenar protocolos pelos mais recentes
  const protocolosOrdenados = useMemo(() => {
    return [...protocolos].sort((a: any, b: any) => {
      const dataA = new Date(a.dataAbertura).getTime();
      const dataB = new Date(b.dataAbertura).getTime();
      return dataB - dataA;
    });
  }, [protocolos]);

  const filteredProtocolos = useMemo(() => {
    return protocolosOrdenados.filter((p: any) => {
      const matchesProtocolo = p.numeroProtocolo
        .toLowerCase()
        .includes(searchProtocolo.toLowerCase());
      const matchesCliente = !searchCliente || (p.cliente?.nome?.toLowerCase().includes(searchCliente.toLowerCase()) || false);
      const matchesTipo = !filterTipo || p.tipoProcesso === filterTipo;
      const matchesStatus = !filterStatus || p.status === filterStatus;
      const matchesCartorio = !filterCartorio || p.cartorio === filterCartorio;
      return matchesProtocolo && matchesCliente && matchesTipo && matchesStatus && matchesCartorio;
    });
  }, [protocolosOrdenados, searchProtocolo, searchCliente, filterTipo, filterStatus, filterCartorio]);

  const handleAddTipo = () => {
    if (novoTipo && !tiposProcesso.includes(novoTipo)) {
      setTiposProcesso([...tiposProcesso, novoTipo]);
      setFormData({ ...formData, tipoProcesso: novoTipo });
      setNovoTipo("");
      toast.success("Tipo de processo adicionado!");
    }
  };

  const handleAddCartorio = () => {
    if (novoCartorio && !cartorios.includes(novoCartorio)) {
      setCartorios([...cartorios, novoCartorio]);
      setFormData({ ...formData, cartorio: novoCartorio });
      setNovoCartorio("");
      toast.success("Cartório adicionado!");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          clienteId: parseInt(formData.clienteId),
          numeroProtocolo: formData.numeroProtocolo,
          tipoprocesso: formData.tipoProcesso as "Georreferenciamento" | "Certidão de Localização" | "Averbação de Qualificação",
          dataAbertura: new Date(formData.dataAbertura),
          status: formData.status as any,
          cartorio: formData.cartorio,
          observacoes: formData.observacoes,
        });
        toast.success("Protocolo atualizado!");
      } else {
        await createMutation.mutateAsync({
          clienteId: parseInt(formData.clienteId),
          numeroProtocolo: formData.numeroProtocolo,
          tipoProcesso: formData.tipoProcesso as "Georreferenciamento" | "Certidão de Localização" | "Averbação de Qualificação",
          dataAbertura: new Date(formData.dataAbertura),
          status: formData.status as any,
          cartorio: formData.cartorio,
          observacoes: formData.observacoes,
        });
        toast.success("Protocolo criado!");
      }
      setFormData({
        clienteId: "",
        numeroProtocolo: "",
        tipoProcesso: "",
        dataAbertura: new Date().toISOString().split("T")[0],
        status: "Pronto",
        cartorio: "",
        observacoes: "",
      });
      setEditingId(null);
      setDialogOpen(false);
      setCurrentPage(1);
      refetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao salvar protocolo";
      toast.error(message);
    }
  };

  const handleEdit = (protocolo: any) => {
    setFormData({
      clienteId: protocolo.clienteId.toString(),
      numeroProtocolo: protocolo.numeroProtocolo,
      tipoProcesso: protocolo.tipoProcesso,
      dataAbertura: new Date(protocolo.dataAbertura).toISOString().split("T")[0],
      status: protocolo.status,
      cartorio: protocolo.cartorio,
      observacoes: protocolo.observacoes || "",
    });
    setEditingId(protocolo.id);
    setDialogOpen(true);
  };

  const arquivoMutation = trpc.arquivo.criar.useMutation();
  const handleArquivar = async (statusProtocoloId: number) => {
    if (confirm("Tem certeza que deseja arquivar este protocolo?")) {
      try {
        await arquivoMutation.mutateAsync({ statusProtocoloId });
        toast.success("Protocolo arquivado com sucesso!");
        refetch();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao arquivar protocolo";
        toast.error(message);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este protocolo?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("Protocolo deletado!");
        setCurrentPage(1);
        refetch();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao deletar protocolo";
        toast.error(message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Status de Protocolos</h1>
          <p className="text-slate-600 mt-2">Acompanhe o status de todos os protocolos</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            setEditingId(null);
            setFormData({
              clienteId: "",
              numeroProtocolo: "",
              tipoProcesso: "",
              dataAbertura: new Date().toISOString().split("T")[0],
              status: "Pronto",
              cartorio: "",
              observacoes: "",
            });
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Protocolo
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Número do Protocolo</label>
              <Input
                placeholder="Buscar por número..."
                value={searchProtocolo}
                onChange={(e) => {
                  setSearchProtocolo(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nome do Cliente</label>
              <Input
                placeholder="Buscar por cliente..."
                value={searchCliente}
                onChange={(e) => {
                  setSearchCliente(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Processo</label>
              <Select value={filterTipo} onValueChange={(value) => {
                setFilterTipo(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {tiposProcesso.map(tipo => (
                    <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <Select value={filterStatus} onValueChange={(value) => {
                setFilterStatus(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {STATUS_OPTIONS.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Cartório</label>
              <Select value={filterCartorio} onValueChange={(value) => {
                setFilterCartorio(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {cartorios.map(cartorio => (
                    <SelectItem key={cartorio} value={cartorio}>{cartorio}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Protocolos</CardTitle>
          <CardDescription>
            Exibindo {filteredProtocolos.length} de {totalItems} protocolo(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-slate-600">Carregando...</div>
          ) : filteredProtocolos.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Protocolo</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Cartório</TableHead>
                      <TableHead>Data Abertura</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProtocolos.map((protocolo: any) => (
                      <TableRow key={protocolo.id}>
                        <TableCell className="font-medium">{protocolo.numeroProtocolo}</TableCell>
                        <TableCell>{protocolo.cliente?.nome || "-"}</TableCell>
                        <TableCell>{protocolo.tipoProcesso}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-sm font-medium ${
                            protocolo.status === "Pronto" ? "bg-green-100 text-green-800" :
                            protocolo.status === "Vencido" ? "bg-red-100 text-red-800" :
                            "bg-blue-100 text-blue-800"
                          }`}>
                            {protocolo.status}
                          </span>
                        </TableCell>
                        <TableCell>{protocolo.cartorio}</TableCell>
                        <TableCell>{new Date(protocolo.dataAbertura).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(protocolo)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleArquivar(protocolo.id)}
                              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                              title="Arquivar"
                            >
                              📦
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(protocolo.id)}
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
              {searchProtocolo || searchCliente || filterTipo || filterStatus || filterCartorio
                ? "Nenhum protocolo encontrado com os filtros aplicados."
                : "Nenhum protocolo cadastrado."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Protocolo" : "Novo Protocolo"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Atualize os dados do protocolo" : "Preencha os dados do novo protocolo"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Cliente</label>
              <Select value={formData.clienteId} onValueChange={(value) => setFormData(prev => ({ ...prev, clienteId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map(cliente => (
                    <SelectItem key={cliente.id} value={cliente.id.toString()}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Número do Protocolo</label>
              <Input
                type="text"
                name="numeroProtocolo"
                value={formData.numeroProtocolo}
                onChange={handleChange}
                placeholder="Ex: 2024/001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Processo</label>
              <div className="flex gap-2">
                <Select value={formData.tipoProcesso} onValueChange={(value) => setFormData(prev => ({ ...prev, tipoProcesso: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposProcesso.map(tipo => (
                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 mt-2">
                <Input
                  type="text"
                  value={novoTipo}
                  onChange={(e) => setNovoTipo(e.target.value)}
                  placeholder="Novo tipo..."
                />
                <Button type="button" onClick={handleAddTipo} variant="outline">Adicionar</Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Data de Abertura</label>
              <Input
                type="date"
                name="dataAbertura"
                value={formData.dataAbertura}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Cartório</label>
              <div className="flex gap-2">
                <Select value={formData.cartorio} onValueChange={(value) => setFormData(prev => ({ ...prev, cartorio: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {cartorios.map(cartorio => (
                      <SelectItem key={cartorio} value={cartorio}>{cartorio}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 mt-2">
                <Input
                  type="text"
                  value={novoCartorio}
                  onChange={(e) => setNovoCartorio(e.target.value)}
                  placeholder="Novo cartório..."
                />
                <Button type="button" onClick={handleAddCartorio} variant="outline">Adicionar</Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Observações</label>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                placeholder="Observações..."
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "Salvando..." : (editingId ? "Atualizar" : "Criar")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
