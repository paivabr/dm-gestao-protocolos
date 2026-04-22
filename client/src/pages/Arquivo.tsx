import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Eye } from "lucide-react";


export default function Arquivo() {
  const toast = (msg: any) => console.log(msg);
  const [selectedArquivo, setSelectedArquivo] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: arquivados, isLoading } = trpc.arquivo.listar.useQuery();
  const utils = trpc.useUtils();
  const deleteMutation = trpc.arquivo.deletar.useMutation({
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Arquivo deletado com sucesso" });
      utils.arquivo.listar.invalidate();
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync({ id: deleteId });
    }
  };

  const formatarData = (data: string | Date) => {
    if (!data) return "-";
    const date = new Date(data);
    // Corrigir timezone: converter para string local sem timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  };

  const formatarValor = (valor: any) => {
    if (!valor) return "R$ 0,00";
    return `R$ ${parseFloat(valor).toFixed(2).replace(".", ",")}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando arquivos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Arquivo de Protocolos</h1>
        <p className="text-gray-600 mt-2">Protocolos finalizados e arquivados</p>
      </div>

      {!arquivados || arquivados.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">Nenhum protocolo arquivado ainda</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Cliente</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Protocolo</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Data Arquivamento</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Custas</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Despesas</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">A Pagar</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Recebido</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {arquivados.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{item.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.clienteNome || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.numeroProtocolo || item.processoTitulo || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatarData(item.dataArquivamento)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatarValor(item.custas)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatarValor(item.despesas)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatarValor(item.valorAPagar)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatarValor(item.valorRecebido)}</td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedArquivo(item)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDeleteId(item.id);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal de Detalhes */}
      <Dialog open={!!selectedArquivo} onOpenChange={() => setSelectedArquivo(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Arquivo</DialogTitle>
          </DialogHeader>
          {selectedArquivo && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">ID</p>
                  <p className="font-semibold">{selectedArquivo.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cliente</p>
                  <p className="font-semibold">{selectedArquivo.clienteNome || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Protocolo</p>
                  <p className="font-semibold">{selectedArquivo.numeroProtocolo || selectedArquivo.processoTitulo || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Data Arquivamento</p>
                  <p className="font-semibold">{formatarData(selectedArquivo.dataArquivamento)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Custas</p>
                  <p className="font-semibold">{formatarValor(selectedArquivo.custas)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Despesas</p>
                  <p className="font-semibold">{formatarValor(selectedArquivo.despesas)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valor a Pagar</p>
                  <p className="font-semibold">{formatarValor(selectedArquivo.valorAPagar)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valor Falta Pagar</p>
                  <p className="font-semibold">{formatarValor(selectedArquivo.valorFaltaPagar)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valor Baixa</p>
                  <p className="font-semibold">{formatarValor(selectedArquivo.valorBaixa)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valor Recebido</p>
                  <p className="font-semibold">{formatarValor(selectedArquivo.valorRecebido)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Gasto</p>
                  <p className="font-semibold">{formatarValor(selectedArquivo.totalGasto)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Recebido</p>
                  <p className="font-semibold">{formatarValor(selectedArquivo.totalRecebido)}</p>
                </div>
              </div>
              {selectedArquivo.observacoesArquivo && (
                <div>
                  <p className="text-sm text-gray-600">Observações</p>
                  <p className="font-semibold">{selectedArquivo.observacoesArquivo}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Deleção */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Deleção</DialogTitle>
          </DialogHeader>
          <p>Tem certeza que deseja deletar este arquivo?</p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deletando..." : "Deletar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
