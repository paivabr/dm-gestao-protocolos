import { useState } from "react";
import { Eye, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

export default function Arquivo() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProtocolo, setSelectedProtocolo] = useState<any | null>(null);

  const { data: arquivados = [], isLoading, refetch } = trpc.arquivo.listar.useQuery();
  const desarquivarMutation = trpc.arquivo.desarquivar.useMutation();

  // Paginação
  const totalPages = Math.ceil(arquivados.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = arquivados.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handleDesarquivar = async (statusProtocoloId: number) => {
    if (!confirm("Tem certeza que deseja desarquivar este protocolo?")) return;
    
    try {
      await desarquivarMutation.mutateAsync({ statusProtocoloId });
      toast.success("Protocolo desarchivado com sucesso!");
      refetch();
      setSelectedProtocolo(null);
    } catch (error) {
      toast.error("Erro ao desarquivar protocolo");
    }
  };

  const formatarDataSemTimezone = (timestamp: any): string => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Arquivo de Protocolos</h1>
        <p className="text-slate-600 mt-2">Protocolos finalizados e arquivados</p>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Protocolos Arquivados ({arquivados.length})</CardTitle>
          <CardDescription>Lista de todos os protocolos finalizados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : arquivados.length === 0 ? (
            <div className="text-center py-8 text-slate-600">Nenhum protocolo arquivado</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data Arquivamento</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((protocolo: any) => (
                      <TableRow key={protocolo.id}>
                        <TableCell className="font-medium">{protocolo.numeroProtocolo}</TableCell>
                        <TableCell>{protocolo.clienteId || "-"}</TableCell>
                        <TableCell>{protocolo.tipoProcesso}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                            {protocolo.status}
                          </span>
                        </TableCell>
                        <TableCell>{formatarDataSemTimezone(protocolo.dataArquivamento)}</TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedProtocolo(protocolo)}
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDesarquivar(protocolo.id)}
                            className="text-amber-600 hover:text-amber-700"
                            title="Desarquivar"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-slate-600">
                    Página {currentPage} de {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <Dialog open={!!selectedProtocolo} onOpenChange={() => setSelectedProtocolo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Protocolo</DialogTitle>
          </DialogHeader>
          {selectedProtocolo && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-600">Número</label>
                <p className="text-slate-900">{selectedProtocolo.numeroProtocolo}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600">Tipo de Processo</label>
                <p className="text-slate-900">{selectedProtocolo.tipoProcesso}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600">Status</label>
                <p className="text-slate-900">{selectedProtocolo.status}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600">Cartório</label>
                <p className="text-slate-900">{selectedProtocolo.cartorio}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600">Data Arquivamento</label>
                <p className="text-slate-900">{formatarDataSemTimezone(selectedProtocolo.dataArquivamento)}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600">Observações</label>
                <p className="text-slate-900 whitespace-pre-wrap">{selectedProtocolo.observacoes || "-"}</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => handleDesarquivar(selectedProtocolo.id)}
                  className="flex-1"
                  variant="outline"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Desarquivar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
