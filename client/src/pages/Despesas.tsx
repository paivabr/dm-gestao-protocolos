import { useState } from "react";
import { Plus, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select-no-portal";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Despesas() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProtocolo, setSelectedProtocolo] = useState<string>("");
  const [formData, setFormData] = useState({
    descricao: "",
    valor: "",
  });

  const { data: protocolos = [] } = trpc.statusProtocolo.listPaginated.useQuery({
    page: 1,
    limit: 100,
  });

  const { data: despesas = [] } = trpc.despesas.listarPorProtocolo.useQuery(
    { statusProtocoloId: parseInt(selectedProtocolo) },
    { enabled: !!selectedProtocolo }
  );

  const utils = trpc.useUtils();

  const createMutation = trpc.despesas.criar.useMutation({
    onSuccess: () => {
      toast.success("Despesa adicionada com sucesso!");
      setFormData({ descricao: "", valor: "" });
      setDialogOpen(false);
      utils.despesas.listarPorProtocolo.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.despesas.atualizar.useMutation({
    onSuccess: () => {
      toast.success("Despesa atualizada!");
      utils.despesas.listarPorProtocolo.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.despesas.deletar.useMutation({
    onSuccess: () => {
      toast.success("Despesa removida!");
      utils.despesas.listarPorProtocolo.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProtocolo) {
      toast.error("Selecione um protocolo");
      return;
    }
    if (!formData.descricao || !formData.valor) {
      toast.error("Preencha todos os campos");
      return;
    }

    await createMutation.mutateAsync({
      statusProtocoloId: parseInt(selectedProtocolo),
      descricao: formData.descricao,
      valor: formData.valor,
    });
  };

  const handleTogglePago = async (despesa: any) => {
    await updateMutation.mutateAsync({
      id: despesa.id,
      pago: despesa.pago ? 0 : 1,
      dataPagamento: despesa.pago ? undefined : new Date(),
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar esta despesa?")) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  const totalDespesas = despesas.reduce((sum, d) => sum + parseFloat(d.valor || "0"), 0);
  const totalPago = despesas
    .filter((d) => d.pago)
    .reduce((sum, d) => sum + parseFloat(d.valor || "0"), 0);
  const totalPendente = totalDespesas - totalPago;

  const protocoloSelecionado = (protocolos as any)?.data?.find((p: any) => p.id === parseInt(selectedProtocolo));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Custas e Despesas</h1>
        <p className="text-slate-600 mt-2">Gerencie custas pagas e adicionais dos protocolos</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selecionar Protocolo</CardTitle>
          <CardDescription>Escolha um protocolo para visualizar suas despesas</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedProtocolo} onValueChange={setSelectedProtocolo}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um protocolo..." />
            </SelectTrigger>
            <SelectContent>
              {(protocolos as any)?.data?.map((p: any) => (
                <SelectItem key={p.id} value={p.id.toString()}>
                  {p.numeroProtocolo} - {p.cliente?.nome || "Sem cliente"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedProtocolo && (
        <>
          {/* Resumo */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-2">Total de Despesas</p>
                  <p className="text-2xl font-bold text-slate-900">R$ {totalDespesas.toFixed(2).replace(".", ",")}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-2">Pago</p>
                  <p className="text-2xl font-bold text-green-600">R$ {totalPago.toFixed(2).replace(".", ",")}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-2">Pendente</p>
                  <p className="text-2xl font-bold text-amber-600">R$ {totalPendente.toFixed(2).replace(".", ",")}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Despesas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Despesas</CardTitle>
                <CardDescription>
                  Protocolo: {protocoloSelecionado?.numeroProtocolo} - {protocoloSelecionado?.cliente?.nome}
                </CardDescription>
              </div>
              <Button onClick={() => setDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Despesa
              </Button>
            </CardHeader>
            <CardContent>
              {despesas.length === 0 ? (
                <div className="text-center py-8 text-slate-600">Nenhuma despesa registrada</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {despesas.map((despesa) => (
                        <TableRow key={despesa.id}>
                          <TableCell>{despesa.descricao}</TableCell>
                          <TableCell>R$ {parseFloat(despesa.valor || "0").toFixed(2).replace(".", ",")}</TableCell>
                          <TableCell>{new Date(despesa.dataDespesa).toLocaleDateString("pt-BR")}</TableCell>
                          <TableCell>
                            {despesa.pago ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Pago</span>
                            ) : (
                              <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-sm">Pendente</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleTogglePago(despesa)}
                                className={despesa.pago ? "text-green-600" : "text-amber-600"}
                              >
                                {despesa.pago ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(despesa.id)}
                                className="text-red-600"
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
              )}
            </CardContent>
          </Card>

          {/* Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Despesa</DialogTitle>
                <DialogDescription>Adicione uma nova despesa para este protocolo</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Descrição</label>
                  <Input
                    type="text"
                    placeholder="Ex: Certidão, Registro, Taxa..."
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Valor (R$)</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Salvando..." : "Adicionar Despesa"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
