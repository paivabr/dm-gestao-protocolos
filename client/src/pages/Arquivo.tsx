import { useState } from "react";
import { Eye, Trash2, Download, FileText, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function Arquivo() {
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: arquivados = [], isLoading, refetch } = trpc.arquivo.listar.useQuery();
  const deleteMutation = trpc.arquivo.deletar.useMutation();

  // Verificar permissão
  if (!user || user.role !== "admin") {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 font-semibold">Apenas administradores podem acessar o arquivo.</p>
      </div>
    );
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este arquivo?")) return;
    
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Arquivo deletado com sucesso");
      refetch();
    } catch (error) {
      toast.error("Erro ao deletar arquivo");
    }
  };

  const handlePrintRelatorio = () => {
    const content = `
      <html>
        <head>
          <title>Relatório de Protocolos Arquivados</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Relatório Geral de Protocolos Arquivados</h1>
          <p>Data de Geração: ${new Date().toLocaleDateString('pt-BR')}</p>
          <table>
            <tr>
              <th>ID</th>
              <th>Status Protocolo ID</th>
              <th>Data Arquivamento</th>
              <th>Total Gasto</th>
              <th>Total Recebido</th>
            </tr>
            ${arquivados.map(a => `
              <tr>
                <td>${a.id}</td>
                <td>${a.statusProtocoloId}</td>
                <td>${new Date(a.dataArquivamento).toLocaleDateString('pt-BR')}</td>
                <td>R$ ${parseFloat(a.totalGasto || '0').toFixed(2)}</td>
                <td>R$ ${parseFloat(a.totalRecebido || '0').toFixed(2)}</td>
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Arquivo de Protocolos</h1>
        <p className="text-slate-600 mt-2">Protocolos finalizados e arquivados</p>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Buscar por ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handlePrintRelatorio} className="gap-2">
              <Download className="h-4 w-4" />
              Relatório Geral
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Protocolos Arquivados ({arquivados.length})</CardTitle>
          <CardDescription>Lista de todos os protocolos finalizados</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : arquivados.length === 0 ? (
            <div className="text-center py-8 text-slate-600">Nenhum protocolo arquivado</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Status Protocolo ID</TableHead>
                    <TableHead>Data Arquivamento</TableHead>
                    <TableHead>Total Gasto</TableHead>
                    <TableHead>Total Recebido</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {arquivados.map((protocolo: any) => (
                    <TableRow key={protocolo.id}>
                      <TableCell className="font-medium">{protocolo.id}</TableCell>
                      <TableCell>{protocolo.statusProtocoloId}</TableCell>
                      <TableCell>{new Date(protocolo.dataArquivamento).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>R$ {parseFloat(protocolo.totalGasto || '0').toFixed(2)}</TableCell>
                      <TableCell>R$ {parseFloat(protocolo.totalRecebido || '0').toFixed(2)}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedId(protocolo.id)}
                          title="Visualizar detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(protocolo.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Deletar"
                        >
                          <Trash2 className="h-4 w-4" />
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
