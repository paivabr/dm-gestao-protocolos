"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Edit2, Trash2, Filter, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function StatusProtocolo() {
  const { user } = useAuth();
  const { data: permissions } = trpc.permissions.getMyPermissions.useQuery();
  const { data: protocolos = [], isLoading, refetch } = trpc.statusProtocolo.list.useQuery();
  const { data: clientes = [] } = trpc.clientes.list.useQuery();
  const createMutation = trpc.statusProtocolo.create.useMutation();
  const updateMutation = trpc.statusProtocolo.update.useMutation();
  const deleteMutation = trpc.statusProtocolo.delete.useMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchProtocolo, setSearchProtocolo] = useState("");
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

  const STATUS_OPTIONS = ["Pronto", "Reingressado", "Reingressado pós pagamento", "Nota de Pagamento", "Exigência", "Protocolado", "Vencido"];

  // Ordenar protocolos pelos mais recentes
  const protocolosOrdenados = useMemo(() => {
    return [...protocolos].sort((a, b) => {
      const dataA = new Date(a.dataAbertura).getTime();
      const dataB = new Date(b.dataAbertura).getTime();
      return dataB - dataA;
    });
  }, [protocolos]);

  const filteredProtocolos = useMemo(() => {
    return protocolosOrdenados.filter((p) => {
      const matchesProtocolo = p.numeroProtocolo
        .toLowerCase()
        .includes(searchProtocolo.toLowerCase());
      const matchesTipo = !filterTipo || p.tipoProcesso === filterTipo;
      const matchesStatus = !filterStatus || p.status === filterStatus;
      const matchesCartorio = !filterCartorio || p.cartorio === filterCartorio;
      return matchesProtocolo && matchesTipo && matchesStatus && matchesCartorio;
    });
  }, [protocolosOrdenados, searchProtocolo, filterTipo, filterStatus, filterCartorio]);

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

  const resetForm = () => {
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
  };

  const handleOpenDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    resetForm();
  };

  const handleCreate = async () => {
    if (!formData.clienteId || !formData.numeroProtocolo || !formData.tipoProcesso || !formData.cartorio) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await createMutation.mutateAsync({
        clienteId: parseInt(formData.clienteId),
        numeroProtocolo: formData.numeroProtocolo,
        tipoProcesso: formData.tipoProcesso as "Georreferenciamento" | "Certidão de Localização" | "Averbação de Qualificação",
        dataAbertura: new Date(formData.dataAbertura),
        status: formData.status as "Pronto" | "Reingressado" | "Reingressado pós pagamento" | "Nota de Pagamento" | "Exigência" | "Protocolado" | "Vencido",
        cartorio: formData.cartorio,
        observacoes: formData.observacoes,
      });
      toast.success("Protocolo criado com sucesso!");
      handleCloseDialog();
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar protocolo");
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    
    try {
      await updateMutation.mutateAsync({
        id: editingId,
        clienteId: parseInt(formData.clienteId),
        numeroProtocolo: formData.numeroProtocolo,
        tipoProcesso: formData.tipoProcesso as "Georreferenciamento" | "Certidão de Localização" | "Averbação de Qualificação",
        dataAbertura: new Date(formData.dataAbertura),
        status: formData.status as "Pronto" | "Reingressado" | "Reingressado pós pagamento" | "Nota de Pagamento" | "Exigência" | "Protocolado" | "Vencido",
        cartorio: formData.cartorio,
        observacoes: formData.observacoes,
      });
      toast.success("Protocolo atualizado com sucesso!");
      handleCloseDialog();
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar protocolo");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este protocolo?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        refetch();
        toast.success("Protocolo deletado com sucesso!");
      } catch (error: any) {
        toast.error(error.message || "Erro ao deletar protocolo");
      }
    }
  };

  const handleEdit = (protocolo: any) => {
    setFormData({
      clienteId: protocolo.clienteId?.toString() || "",
      numeroProtocolo: protocolo.numeroProtocolo || "",
      tipoProcesso: protocolo.tipoProcesso || "",
      dataAbertura: protocolo.dataAbertura ? new Date(protocolo.dataAbertura).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      status: protocolo.status || "Pronto",
      cartorio: protocolo.cartorio || "",
      observacoes: protocolo.observacoes || "",
    });
    setEditingId(protocolo.id);
    setDialogOpen(true);
  };

  // Bloquear acesso se não tem permissão
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
            <p className="text-red-600">Você não tem permissão para acessar esta página. Solicite ao administrador.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pronto":
        return "bg-green-100 text-green-800";
      case "Reingressado":
        return "bg-blue-100 text-blue-800";
      case "Reingressado pós pagamento":
        return "bg-purple-100 text-purple-800";
      case "Nota de Pagamento":
        return "bg-yellow-100 text-yellow-800";
      case "Exigência":
        return "bg-red-100 text-red-800";
      case "Protocolado":
        return "bg-indigo-100 text-indigo-800";
      case "Vencido":
        return "bg-red-200 text-red-900";
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
        <Button onClick={handleOpenDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Protocolo
        </Button>
      </div>

      {/* Dialog único para criar e editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Protocolo" : "Novo Protocolo"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Atualize as informações do protocolo" : "Adicione um novo protocolo de registro"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Cliente *</label>
              <Select value={formData.clienteId} onValueChange={(value) => setFormData({ ...formData, clienteId: value })}>
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
                placeholder="Ex: 123456"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Tipo de Processo *</label>
              <div className="flex gap-2">
                <Select value={formData.tipoProcesso} onValueChange={(value) => setFormData({ ...formData, tipoProcesso: value })}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposProcesso.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Novo tipo"
                  value={novoTipo}
                  onChange={(e) => setNovoTipo(e.target.value)}
                  className="w-32"
                />
                <Button onClick={handleAddTipo} variant="outline" size="sm">
                  Adicionar
                </Button>
              </div>
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
              <label className="text-sm font-medium">Status</label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
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
              <label className="text-sm font-medium">Cartório *</label>
              <div className="flex gap-2">
                <Select value={formData.cartorio} onValueChange={(value) => setFormData({ ...formData, cartorio: value })}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {cartorios.map((cartorio) => (
                      <SelectItem key={cartorio} value={cartorio}>
                        {cartorio}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Novo cartório"
                  value={novoCartorio}
                  onChange={(e) => setNovoCartorio(e.target.value)}
                  className="w-32"
                />
                <Button onClick={handleAddCartorio} variant="outline" size="sm">
                  Adicionar
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Observações</label>
              <Input
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Observações adicionais"
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button onClick={editingId ? handleUpdate : handleCreate}>
                {editingId ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <Input
              placeholder="Buscar protocolo..."
              value={searchProtocolo}
              onChange={(e) => setSearchProtocolo(e.target.value)}
              className="flex-1 min-w-64"
            />
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tipo de Processo" />
              </SelectTrigger>
              <SelectContent>
                {tiposProcesso.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
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
            <Select value={filterCartorio} onValueChange={setFilterCartorio}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Cartório" />
              </SelectTrigger>
              <SelectContent>
                {cartorios.map((cartorio) => (
                  <SelectItem key={cartorio} value={cartorio}>
                    {cartorio}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(searchProtocolo || filterTipo || filterStatus || filterCartorio) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchProtocolo("");
                  setFilterTipo("");
                  setFilterStatus("");
                  setFilterCartorio("");
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Limpar Filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Protocolos */}
      <Card>
        <CardHeader>
          <CardTitle>Protocolos ({filteredProtocolos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Carregando...</div>
          ) : filteredProtocolos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Nenhum protocolo encontrado</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cartório</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProtocolos.map((protocolo: any) => (
                    <TableRow key={protocolo.id}>
                      <TableCell className="font-medium">{protocolo.numeroProtocolo}</TableCell>
                      <TableCell>{protocolo.cliente?.nome || "-"}</TableCell>
                      <TableCell>{protocolo.tipoProcesso}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-sm ${getStatusColor(protocolo.status)}`}>
                          {protocolo.status}
                        </span>
                      </TableCell>
                      <TableCell>{protocolo.cartorio}</TableCell>
                      <TableCell>{new Date(protocolo.dataAbertura).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(protocolo)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(protocolo.id)}
                        >
                          <Trash2 className="w-4 h-4" />
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
    </div>
  );
}
