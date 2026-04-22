import { useState, useMemo } from "react";
import { Plus, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Receitas() {
  const [selectedProtocolo, setSelectedProtocolo] = useState("");
  const [newReceitaOpen, setNewReceitaOpen] = useState(false);
  const [formData, setFormData] = useState({
    descricao: "",
    valor: "",
  });

  const { data: protocolos = [] } = trpc.statusProtocolo.list.useQuery();
  const protocolosData = protocolos || [];

  const receitas = useMemo(() => {
    if (!selectedProtocolo) return [];
    // Simular dados de receitas - em produção viriam do servidor
    return [];
  }, [selectedProtocolo]);

  const totalReceitas = receitas.reduce((sum, r: any) => sum + parseFloat(r.valor || "0"), 0);
  const totalRecebido = receitas
    .filter((r: any) => r.recebido)
    .reduce((sum, r: any) => sum + parseFloat(r.valor || "0"), 0);
  const totalPendente = totalReceitas - totalRecebido;

  const handleAddReceita = () => {
    if (!formData.descricao || !formData.valor) {
      toast.error("Preencha todos os campos");
      return;
    }
    toast.success("Receita adicionada com sucesso!");
    setFormData({ descricao: "", valor: "" });
    setNewReceitaOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Gestão de Receitas</h1>
        <p className="text-slate-600 mt-2">Rastreie as receitas cobradas dos clientes</p>
      </div>

      {/* Seleção de Protocolo */}
      <Card>
        <CardHeader>
          <CardTitle>Selecione um Protocolo</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedProtocolo} onValueChange={setSelectedProtocolo}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um protocolo..." />
            </SelectTrigger>
            <SelectContent>
              {protocolosData.map((p: any) => (
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
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total de Receitas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {totalReceitas.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-600">Recebido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">R$ {totalRecebido.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-amber-600">Pendente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">R$ {totalPendente.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Botão Adicionar */}
          <div>
            <Dialog open={newReceitaOpen} onOpenChange={setNewReceitaOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Receita
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Receita</DialogTitle>
                  <DialogDescription>Registre uma receita cobrada do cliente</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Descrição</label>
                    <Input
                      placeholder="Ex: Honorários, Taxa de protocolo, etc."
                      value={formData.descricao}
                      onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Valor (R$)</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      value={formData.valor}
                      onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                    />
                  </div>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleAddReceita}
                  >
                    Adicionar Receita
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Tabela de Receitas */}
          <Card>
            <CardHeader>
              <CardTitle>Receitas do Protocolo</CardTitle>
              <CardDescription>
                {receitas.length} receita(s) registrada(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {receitas.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receitas.map((receita: any) => (
                        <TableRow key={receita.id}>
                          <TableCell>{receita.descricao}</TableCell>
                          <TableCell className="font-medium">R$ {parseFloat(receita.valor).toFixed(2)}</TableCell>
                          <TableCell>{new Date(receita.dataReceita).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-sm font-medium ${
                              receita.recebido
                                ? "bg-green-100 text-green-800"
                                : "bg-amber-100 text-amber-800"
                            }`}>
                              {receita.recebido ? "Recebido" : "Pendente"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              {!receita.recebido && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  title="Marcar como recebido"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Deletar"
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
              ) : (
                <div className="text-center py-8 text-slate-600">
                  Nenhuma receita registrada para este protocolo
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
