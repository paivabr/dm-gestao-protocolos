import { useState, useMemo } from "react";
import { Plus, Search, Edit2, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

const TIPOS_PROCESSO = [
  "Georreferenciamento",
  "Certidão de Localização",
  "Averbação de Qualificação",
];

const STATUS_OPTIONS = ["Pronto", "Reivindicado", "Vencido"];

const CARTORIOS = [
  "Colatina",
  "Santa Teresa",
  "Linares",
  "João Neiva",
  "Marialândia",
];

export default function StatusProtocolo() {
  const { user } = useAuth();
  const { data: protocolos = [], isLoading, refetch } = trpc.statusProtocolo.list.useQuery();
  const { data: clientes = [] } = trpc.clientes.list.useQuery();
  const createMutation = trpc.statusProtocolo.create.useMutation();
  const updateMutation = trpc.statusProtocolo.update.useMutation();
  const deleteMutation = trpc.statusProtocolo.delete.useMutation();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchProtocolo, setSearchProtocolo] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCartorio, setFilterCartorio] = useState("");
  const [formData, setFormData] = useState({
    clienteId: 0,
    numeroProtocolo: "",
    tipoProcesso: "",
    dataAbertura: new Date().toISOString().split("T")[0],
    status: "Pronto",
    cartorio: "",
    observacoes: "",
  });

  const filteredProtocolos = useMemo(() => {
    return protocolos.filter((p) => {
      const matchesProtocolo = p.numeroProtocolo
        .toLowerCase()
        .includes(searchProtocolo.toLowerCase());
      const matchesTipo = !filterTipo || p.tipoProcesso === filterTipo;
      const matchesStatus = !filterStatus || p.status === filterStatus;
      const matchesCartorio = !filterCartorio || p.cartorio === filterCartorio;
      return matchesProtocolo && matchesTipo && matchesStatus && matchesCartorio;
    });
  }, [protocolos, searchProtocolo, filterTipo, filterStatus, filterCartorio]);

  const handleCreate = async () => {
    if (!formData.clienteId || !formData.numeroProtocolo || !formData.tipoProcesso || !formData.cartorio) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await createMutation.mutateAsync({
        ...formData,
        clienteId: parseInt(formData.clienteId.toString()),
        dataAbertura: new Date(formData.dataAbertura),
        tipoProcesso: formData.tipoProcesso as "Georreferenciamento" | "Certidão de Localização" | "Averbação de Qualificação",
        status: formData.status as "Pronto" | "Reivindicado" | "Vencido",
      });
      setOpen(false);
      setFormData({
        clienteId: 0,
        numeroProtocolo: "",
        tipoProcesso: "",
        dataAbertura: new Date().toISOString().split("T")[0],
        status: "Pronto",
        cartorio: "",
        observacoes: "",
      });
      refetch();
    } catch (error) {
      console.error("Erro ao criar protocolo:", error);
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      const protocolo = protocolos.find((p) => p.id === id);
      if (!protocolo) return;

      await updateMutation.mutateAsync({
        id,
        status: formData.status as "Pronto" | "Reivindicado" | "Vencido",
        observacoes: formData.observacoes,
      });
      setEditingId(null);
      setFormData({
        clienteId: 0,
        numeroProtocolo: "",
        tipoProcesso: "",
        dataAbertura: new Date().toISOString().split("T")[0],
        status: "Pronto",
        cartorio: "",
        observacoes: "",
      });
      refetch();
    } catch (error) {
      console.error("Erro ao atualizar protocolo:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este protocolo?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        refetch();
      } catch (error) {
        console.error("Erro ao deletar protocolo:", error);
      }
    }
  };

  const handleEdit = (protocolo: any) => {
    setEditingId(protocolo.id);
    setFormData({
      clienteId: protocolo.clienteId,
      numeroProtocolo: protocolo.numeroProtocolo,
      tipoProcesso: protocolo.tipoProcesso,
      dataAbertura: new Date(protocolo.dataAbertura).toISOString().split("T")[0],
      status: protocolo.status,
      cartorio: protocolo.cartorio,
      observacoes: protocolo.observacoes || "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pronto":
        return "bg-green-100 text-green-800";
      case "Reivindicado":
        return "bg-orange-100 text-orange-800";
      case "Vencido":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Status de Protocolo</h1>
          <p className="text-gray-600">Gerenciar protocolos de registro de imóveis</p>
        </div>
        <Dialog open={open && !editingId} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Protocolo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Protocolo</DialogTitle>
              <DialogDescription>Adicione um novo protocolo de registro</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Cliente *</label>
                <Select value={formData.clienteId.toString()} onValueChange={(value) => setFormData({ ...formData, clienteId: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente: any) => (
                      <SelectItem key={cliente.id} value={cliente.id.toString()}>
                        {cliente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Número do Protocolo *</label>
                <Input
                  value={formData.numeroProtocolo}
                  onChange={(e) => setFormData({ ...formData, numeroProtocolo: e.target.value })}
                  placeholder="Ex: 156514"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tipo de Processo *</label>
                <Select value={formData.tipoProcesso} onValueChange={(value) => setFormData({ ...formData, tipoProcesso: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_PROCESSO.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Data de Abertura</label>
                <Input
                  type="date"
                  value={formData.dataAbertura}
                  onChange={(e) => setFormData({ ...formData, dataAbertura: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Cartório *</label>
                <Select value={formData.cartorio} onValueChange={(value) => setFormData({ ...formData, cartorio: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cartório" />
                  </SelectTrigger>
                  <SelectContent>
                    {CARTORIOS.map((cartorio) => (
                      <SelectItem key={cartorio} value={cartorio}>
                        {cartorio}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Observações</label>
                <Input
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Adicione observações"
                />
              </div>
              <Button onClick={handleCreate} className="w-full">
                Criar Protocolo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex gap-2">
              <Search className="w-4 h-4 mt-3 text-gray-400" />
              <Input
                placeholder="Buscar protocolo..."
                value={searchProtocolo}
                onChange={(e) => setSearchProtocolo(e.target.value)}
              />
            </div>
            <Select value={filterTipo || ""} onValueChange={setFilterTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Processo" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_PROCESSO.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus || ""} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCartorio || ""} onValueChange={setFilterCartorio}>
              <SelectTrigger>
                <SelectValue placeholder="Cartório" />
              </SelectTrigger>
              <SelectContent>
                {CARTORIOS.map((cartorio) => (
                  <SelectItem key={cartorio} value={cartorio}>
                    {cartorio}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Protocolos ({filteredProtocolos.length})</CardTitle>
          <CardDescription>Lista de todos os protocolos registrados</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Carregando...</p>
          ) : filteredProtocolos.length === 0 ? (
            <p className="text-gray-500">Nenhum protocolo encontrado</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Protocolo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data Abertura</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cartório</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProtocolos.map((protocolo: any) => (
                    <TableRow key={protocolo.id}>
                      <TableCell className="font-medium">{protocolo.numeroProtocolo}</TableCell>
                      <TableCell>{clientes.find((c: any) => c.id === protocolo.clienteId)?.nome || "N/A"}</TableCell>
                      <TableCell>{protocolo.tipoProcesso}</TableCell>
                      <TableCell>{new Date(protocolo.dataAbertura).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(protocolo.status)}`}>
                          {protocolo.status}
                        </span>
                      </TableCell>
                      <TableCell>{protocolo.cartorio}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(protocolo)}
                          className="gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(protocolo.id)}
                          className="gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Deletar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {editingId && (
        <Dialog open={!!editingId} onOpenChange={() => setEditingId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Protocolo</DialogTitle>
              <DialogDescription>Atualize o status e observações do protocolo</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={formData.status || "Pronto"} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Observações</label>
                <Input
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Adicione observações"
                />
              </div>
              <Button onClick={() => handleUpdate(editingId)} className="w-full">
                Salvar Alterações
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
