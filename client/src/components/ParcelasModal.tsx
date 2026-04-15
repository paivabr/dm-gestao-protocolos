import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";

interface ParcelasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  processoId: number;
}

export default function ParcelasModal({ open, onOpenChange, processoId }: ParcelasModalProps) {
  const [formData, setFormData] = useState({
    numeroParcelas: "1",
    valorTotal: "",
  });

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

  const totalPago = parcelas
    .filter((p) => p.pago === 1)
    .reduce((sum, p) => sum + parseFloat(p.valorParcela), 0);

  const totalAPagar = parcelas
    .filter((p) => p.pago === 0)
    .reduce((sum, p) => sum + parseFloat(p.valorParcela), 0);

  const totalGeral = parcelas.reduce((sum, p) => sum + parseFloat(p.valorParcela), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
              {/* Resumo de pagamentos */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Geral</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-gray-900">
                      R$ {totalGeral.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-700">Pago</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-700">
                      R$ {totalPago.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-orange-50 border-orange-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-orange-700">A Pagar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-orange-700">
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
                        <p className="text-sm text-gray-600">
                          R$ {parseFloat(parcela.valorParcela).toFixed(2)}
                        </p>
                        {parcela.pago === 1 && parcela.dataPagamento && (
                          <p className="text-xs text-green-600">
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
