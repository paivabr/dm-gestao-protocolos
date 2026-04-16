import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Check, X, Edit2 } from "lucide-react";
import { toast } from "sonner";

interface ParcelasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  processoId: number;
}

export default function ParcelasModal({ open, onOpenChange, processoId }: ParcelasModalProps) {
  const { user } = useAuth();
  const { data: permissions } = trpc.permissions.getMyPermissions.useQuery();
  
  // Verificar se o usuário tem permissão para gerenciar parcelas
  const canManageParcelas = user?.role === "admin" || permissions?.canManageParcelas;
  
  const [formData, setFormData] = useState({
    numeroParcelas: "1",
    valorTotal: "",
  });
  const [editandoDescontoId, setEditandoDescontoId] = useState<number | null>(null);
  const [descontoEditando, setDescontoEditando] = useState("");
  const [descontoUnico, setDescontoUnico] = useState("");
  const [aplicandoDescontoUnico, setAplicandoDescontoUnico] = useState(false);

  const { data: parcelas = [], refetch } = trpc.parcelas.getByProcesso.useQuery(
    { processoId },
    { enabled: open }
  );

  const createMutation = trpc.parcelas.create.useMutation({
    onSuccess: () => {
      refetch();
      setFormData({ numeroParcelas: "1", valorTotal: "" });
      toast.success("Parcelas criadas com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar parcelas");
    },
  });

  const marcarComoPagaMutation = trpc.parcelas.marcarComoPaga.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Parcela marcada como paga!");
    },
  });

  const marcarComoNaoPagaMutation = trpc.parcelas.marcarComoNaoPaga.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Parcela marcada como não paga!");
    },
  });

  const deleteMutation = trpc.parcelas.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Parcela deletada com sucesso!");
    },
  });

  const updateDescontoMutation = trpc.parcelas.updateDesconto.useMutation({
    onSuccess: () => {
      refetch();
      setEditandoDescontoId(null);
      setDescontoEditando("");
      toast.success("Desconto atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar desconto");
    },
  });

  const handleCreateParcelas = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.valorTotal || !formData.numeroParcelas) {
      toast.error("Preencha todos os campos");
      return;
    }

    const numParcelas = parseInt(formData.numeroParcelas);
    const valorTotal = parseFloat(formData.valorTotal);
    const valorPorParcela = (valorTotal / numParcelas).toFixed(2);

    try {
      for (let i = 1; i <= numParcelas; i++) {
        await createMutation.mutateAsync({
          processoId,
          numeroParcela: i,
          valorParcela: valorPorParcela,
        });
      }
    } catch (error) {
      console.error("Erro ao criar parcelas:", error);
    }
  };

  const handleTogglePago = async (parcelaId: number, pago: number) => {
    if (pago === 1) {
      await marcarComoNaoPagaMutation.mutateAsync({ id: parcelaId });
    } else {
      await marcarComoPagaMutation.mutateAsync({ id: parcelaId });
    }
  };

  const handleDeleteParcela = async (parcelaId: number) => {
    if (confirm("Tem certeza que deseja deletar esta parcela?")) {
      await deleteMutation.mutateAsync({ id: parcelaId });
    }
  };

  const handleSalvarDesconto = async (parcelaId: number) => {
    if (descontoEditando === "" || parseFloat(descontoEditando) < 0) {
      toast.error("Desconto inválido");
      return;
    }
    
    const parcela = parcelas.find(p => p.id === parcelaId);
    if (!parcela) {
      toast.error("Parcela não encontrada");
      return;
    }
    
    const desconto = parseFloat(descontoEditando);
    const valor = parseFloat(parcela.valorParcela);
    
    if (desconto > valor) {
      toast.error(`Desconto não pode ser maior que R$ ${valor.toFixed(2)}`);
      return;
    }
    
    await updateDescontoMutation.mutateAsync({
      id: parcelaId,
      desconto: descontoEditando,
    });
  };

  const handleAplicarDescontoUnico = async () => {
    if (descontoUnico === "" || parseFloat(descontoUnico) <= 0) {
      toast.error("Desconto inválido");
      return;
    }

    const descontoTotal = parseFloat(descontoUnico);
    const totalGeral = parcelas.reduce((sum, p) => sum + parseFloat(p.valorParcela), 0);

    if (descontoTotal > totalGeral) {
      toast.error(`Desconto não pode ser maior que R$ ${totalGeral.toFixed(2)}`);
      return;
    }

    setAplicandoDescontoUnico(true);
    try {
      const descontoPorParcela = (descontoTotal / parcelas.length).toFixed(2);
      
      for (const parcela of parcelas) {
        await updateDescontoMutation.mutateAsync({
          id: parcela.id,
          desconto: descontoPorParcela,
        });
      }
      
      setDescontoUnico("");
      toast.success(`Desconto de R$ ${descontoTotal.toFixed(2)} aplicado a todas as parcelas!`);
    } catch (error) {
      console.error("Erro ao aplicar desconto:", error);
    } finally {
      setAplicandoDescontoUnico(false);
    }
  };

  const totalDesconto = parcelas.reduce((sum, p) => sum + parseFloat(p.desconto || "0"), 0);

  const totalPago = parcelas
    .filter((p) => p.pago === 1)
    .reduce((sum, p) => sum + (parseFloat(p.valorParcela) - parseFloat(p.desconto || "0")), 0);

  const totalAPagar = parcelas
    .filter((p) => p.pago === 0)
    .reduce((sum, p) => sum + (parseFloat(p.valorParcela) - parseFloat(p.desconto || "0")), 0);

  const totalGeral = parcelas.reduce((sum, p) => sum + parseFloat(p.valorParcela), 0);
  const totalGeralComDesconto = totalGeral - totalDesconto;

  if (!canManageParcelas) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-full max-h-[95vh] overflow-y-auto w-screen">
          <DialogHeader>
            <DialogTitle>Acesso Negado</DialogTitle>
            <DialogDescription>Você não tem permissão para gerenciar parcelas de pagamento</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <p className="text-center text-gray-600">Entre em contato com um administrador para obter acesso a esta funcionalidade.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full max-h-[95vh] overflow-y-auto w-screen">
        <DialogHeader>
          <DialogTitle>Gerenciar Parcelas de Pagamento</DialogTitle>
          <DialogDescription>Adicione e controle as parcelas de pagamento do serviço</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Formulário para criar parcelas */}
          {parcelas.length === 0 ? (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">Criar Parcelas</CardTitle>
                <CardDescription>Defina o número de parcelas e o valor total</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateParcelas} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Parcelas
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max="12"
                        value={formData.numeroParcelas}
                        onChange={(e) =>
                          setFormData({ ...formData, numeroParcelas: e.target.value })
                        }
                        placeholder="Ex: 3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valor Total (R$)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.valorTotal}
                        onChange={(e) =>
                          setFormData({ ...formData, valorTotal: e.target.value })
                        }
                        placeholder="Ex: 3000.00"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createMutation.isPending}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Parcelas
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Campo de desconto único */}
              <Card className="bg-purple-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-lg">Aplicar Desconto Único</CardTitle>
                  <CardDescription>Distribui o desconto igualmente entre todas as parcelas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={descontoUnico}
                      onChange={(e) => setDescontoUnico(e.target.value)}
                      placeholder="Ex: 1000.00"
                      className="flex-1"
                    />
                    <Button
                      onClick={handleAplicarDescontoUnico}
                      disabled={aplicandoDescontoUnico || !descontoUnico}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Aplicar
                    </Button>
                  </div>
                  {descontoUnico && parcelas.length > 0 && (
                    <p className="text-xs text-gray-600 mt-2">
                      Cada parcela receberá: R$ {(parseFloat(descontoUnico) / parcelas.length).toFixed(2)}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Resumo de pagamentos */}
              <div className="grid grid-cols-4 gap-6">
                <Card className="border-2 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-gray-700">Total Geral</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-gray-900">
                      R$ {totalGeral.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-red-50 border-red-300 border-2 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-red-700">Desconto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-red-700">
                      -R$ {totalDesconto.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-300 border-2 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-green-700">Pago</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-green-700">
                      R$ {totalPago.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-orange-50 border-orange-300 border-2 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-orange-700">A Pagar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-orange-700">
                      R$ {totalAPagar.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Lista de parcelas */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Parcelas</h3>
                {parcelas.map((parcela) => (
                  <div
                    key={parcela.id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                      parcela.pago === 1
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <button
                        onClick={() => handleTogglePago(parcela.id, parcela.pago)}
                        className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                          parcela.pago === 1
                            ? "bg-green-500 border-green-500"
                            : "border-gray-300 hover:border-green-500"
                        }`}
                      >
                        {parcela.pago === 1 && (
                          <Check className="h-4 w-4 text-white" />
                        )}
                      </button>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          Parcela {parcela.numeroParcela}
                        </p>
                        {editandoDescontoId === parcela.id ? (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm text-gray-600">R$ {parseFloat(parcela.valorParcela).toFixed(2)}</span>
                            <span className="text-sm">-</span>
                            <Input
                              type="number"
                              step="0.01"
                              value={descontoEditando}
                              onChange={(e) => setDescontoEditando(e.target.value)}
                              placeholder="0.00"
                              className="w-20 h-8 text-xs"
                            />
                            <span className="text-sm">=</span>
                            <span className="text-sm font-semibold">
                              R$ {(parseFloat(parcela.valorParcela) - parseFloat(descontoEditando || "0")).toFixed(2)}
                            </span>
                            <Button
                              size="sm"
                              className="h-8 text-xs ml-2"
                              onClick={() => handleSalvarDesconto(parcela.id)}
                              disabled={updateDescontoMutation.isPending}
                            >
                              Salvar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs"
                              onClick={() => {
                                setEditandoDescontoId(null);
                                setDescontoEditando("");
                              }}
                            >
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <span>R$ {parseFloat(parcela.valorParcela).toFixed(2)}</span>
                            {parseFloat(parcela.desconto || "0") > 0 && (
                              <>
                                <span>-</span>
                                <span className="text-red-600 font-semibold">R$ {parseFloat(parcela.desconto).toFixed(2)}</span>
                                <span>=</span>
                                <span className="font-semibold text-gray-900">
                                  R$ {(parseFloat(parcela.valorParcela) - parseFloat(parcela.desconto || "0")).toFixed(2)}
                                </span>
                              </>
                            )}
                            <button
                              onClick={() => {
                                setEditandoDescontoId(parcela.id);
                                setDescontoEditando(parcela.desconto || "0");
                              }}
                              className="text-blue-600 hover:text-blue-700 ml-2"
                              title="Editar desconto"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                        {parcela.pago === 1 && parcela.dataPagamento && (
                          <p className="text-xs text-green-600 mt-1">
                            Pago em {new Date(parcela.dataPagamento).toLocaleDateString("pt-BR")}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteParcela(parcela.id)}
                      disabled={deleteMutation.isPending}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
