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
  const [editandoValorPagoId, setEditandoValorPagoId] = useState<number | null>(null);
  const [valorPagoEditando, setValorPagoEditando] = useState("");

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

  const updateValorPagoMutation = trpc.parcelas.updateValorPago.useMutation({
    onSuccess: () => {
      refetch();
      setEditandoValorPagoId(null);
      setValorPagoEditando("");
      toast.success("Valor pago atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar valor pago");
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

  const handleSalvarValorPago = async (parcelaId: number) => {
    if (valorPagoEditando === "" || parseFloat(valorPagoEditando) < 0) {
      toast.error("Valor pago inválido");
      return;
    }
    
    const parcela = parcelas.find(p => p.id === parcelaId);
    if (!parcela) {
      toast.error("Parcela não encontrada");
      return;
    }
    
    const valorPago = parseFloat(valorPagoEditando);
    const valorParcela = parseFloat(parcela.valorParcela);
    const desconto = parseFloat(parcela.desconto || "0");
    const valorComDesconto = valorParcela - desconto;
    
    if (valorPago > valorComDesconto) {
      toast.error(`Valor pago não pode ser maior que R$ ${valorComDesconto.toFixed(2)}`);
      return;
    }
    
    await updateValorPagoMutation.mutateAsync({
      id: parcelaId,
      valorPago: valorPagoEditando,
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

  const totalPago = parcelas.reduce((sum, p) => sum + parseFloat(p.valorPago || "0"), 0);

  const totalAPagar = parcelas.reduce((sum, p) => {
    const valorParcela = parseFloat(p.valorParcela);
    const desconto = parseFloat(p.desconto || "0");
    const valorPago = parseFloat(p.valorPago || "0");
    const valorComDesconto = valorParcela - desconto;
    return sum + (valorComDesconto - valorPago);
  }, 0);

  const totalGeral = parcelas.reduce((sum, p) => sum + parseFloat(p.valorParcela), 0);
  const totalGeralComDesconto = totalGeral - totalDesconto;

  if (!canManageParcelas) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto w-full">
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
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto w-full">
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
                  {totalGeralComDesconto > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      Total com desconto: <span className="font-semibold">R$ {totalGeralComDesconto.toFixed(2)}</span>
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Resumo de pagamentos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                <Card className="border-2 shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold text-gray-700">Total Geral</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm lg:text-base font-bold text-gray-900 break-words">
                      R$ {totalGeral.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-red-50 border-red-300 border-2 shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold text-red-700">Desconto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm lg:text-base font-bold text-red-700 break-words">
                      -R$ {totalDesconto.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-300 border-2 shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold text-green-700">Pago</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm lg:text-base font-bold text-green-700 break-words">
                      R$ {totalPago.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-orange-50 border-orange-300 border-2 shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold text-orange-700">A Pagar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm lg:text-base font-bold text-orange-700 break-words">
                      R$ {totalAPagar.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Lista de parcelas */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Parcelas</h3>
                {parcelas.map((parcela) => {
                  const valorParcela = parseFloat(parcela.valorParcela);
                  const desconto = parseFloat(parcela.desconto || "0");
                  const valorComDesconto = valorParcela - desconto;
                  const valorPago = parseFloat(parcela.valorPago || "0");
                  const saldoRestante = valorComDesconto - valorPago;
                  const percentualPago = valorComDesconto > 0 ? (valorPago / valorComDesconto) * 100 : 0;

                  return (
                    <div
                      key={parcela.id}
                      className={`flex flex-col gap-3 p-4 rounded-lg border-2 ${
                        saldoRestante <= 0
                          ? "bg-green-50 border-green-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      {/* Cabeçalho da parcela */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            Parcela {parcela.numeroParcela}
                          </p>
                          {parcela.dataPagamento && (
                            <p className="text-xs text-green-600">
                              Pago em {new Date(parcela.dataPagamento).toLocaleDateString("pt-BR")}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteParcela(parcela.id)}
                          disabled={deleteMutation.isPending}
                          className="text-red-600 hover:text-red-700 p-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Barra de progresso */}
                      {valorComDesconto > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Progresso de pagamento</span>
                            <span>{percentualPago.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(percentualPago, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Valores */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        {/* Valor da parcela */}
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <p className="text-xs text-gray-600">Valor</p>
                          <p className="font-semibold text-gray-900">R$ {valorParcela.toFixed(2)}</p>
                        </div>

                        {/* Desconto */}
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-600">Desconto</p>
                            <button
                              onClick={() => {
                                setEditandoDescontoId(parcela.id);
                                setDescontoEditando(parcela.desconto || "0");
                              }}
                              className="text-blue-600 hover:text-blue-700"
                              title="Editar desconto"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                          </div>
                          {editandoDescontoId === parcela.id ? (
                            <div className="flex gap-1 mt-1">
                              <Input
                                type="number"
                                step="0.01"
                                value={descontoEditando}
                                onChange={(e) => setDescontoEditando(e.target.value)}
                                placeholder="0.00"
                                className="h-7 text-xs flex-1"
                              />
                              <Button
                                size="sm"
                                className="h-7 text-xs px-2"
                                onClick={() => handleSalvarDesconto(parcela.id)}
                                disabled={updateDescontoMutation.isPending}
                              >
                                OK
                              </Button>
                            </div>
                          ) : (
                            <p className={`font-semibold ${desconto > 0 ? "text-red-600" : "text-gray-900"}`}>
                              {desconto > 0 ? "-" : ""}R$ {desconto.toFixed(2)}
                            </p>
                          )}
                        </div>

                        {/* Valor com desconto */}
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <p className="text-xs text-gray-600">Total</p>
                          <p className="font-semibold text-gray-900">R$ {valorComDesconto.toFixed(2)}</p>
                        </div>
                      </div>

                      {/* Valor pago e saldo */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        {/* Valor pago */}
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-600">Valor Pago</p>
                            <button
                              onClick={() => {
                                setEditandoValorPagoId(parcela.id);
                                setValorPagoEditando(parcela.valorPago || "0");
                              }}
                              className="text-blue-600 hover:text-blue-700"
                              title="Editar valor pago"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                          </div>
                          {editandoValorPagoId === parcela.id ? (
                            <div className="flex gap-1 mt-1">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max={valorComDesconto.toFixed(2)}
                                value={valorPagoEditando}
                                onChange={(e) => setValorPagoEditando(e.target.value)}
                                placeholder="0.00"
                                className="h-7 text-xs flex-1"
                              />
                              <Button
                                size="sm"
                                className="h-7 text-xs px-2"
                                onClick={() => handleSalvarValorPago(parcela.id)}
                                disabled={updateValorPagoMutation.isPending}
                              >
                                OK
                              </Button>
                            </div>
                          ) : (
                            <p className={`font-semibold ${valorPago > 0 ? "text-green-600" : "text-gray-900"}`}>
                              R$ {valorPago.toFixed(2)}
                            </p>
                          )}
                        </div>

                        {/* Saldo restante */}
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <p className="text-xs text-gray-600">Saldo Restante</p>
                          <p className={`font-semibold ${saldoRestante > 0 ? "text-orange-600" : "text-green-600"}`}>
                            R$ {Math.max(0, saldoRestante).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
