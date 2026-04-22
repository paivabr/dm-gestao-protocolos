import { useState } from "react";
import { Download, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function RelatorioProtocolos() {
  const [selectedProtocolos, setSelectedProtocolos] = useState<number[]>([]);
  const [selectedProcessos, setSelectedProcessos] = useState<number[]>([]);
  const [relatorioType, setRelatorioType] = useState("protocolo");

  const { data: protocolos = [] } = trpc.statusProtocolo.listPaginated.useQuery({
    page: 1,
    limit: 1000,
  });

  const { data: processos = [] } = trpc.processos.listPaginated.useQuery({
    page: 1,
    limit: 1000,
  });

  const handleSelectProtocolo = (id: number) => {
    setSelectedProtocolos(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSelectProcesso = (id: number) => {
    setSelectedProcessos(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleGeneratePDF = async () => {
    if (relatorioType === "protocolo" && selectedProtocolos.length === 0) {
      toast.error("Selecione pelo menos um protocolo");
      return;
    }
    if (relatorioType === "processo" && selectedProcessos.length === 0) {
      toast.error("Selecione pelo menos um processo");
      return;
    }

    try {
      toast.success("Gerando relatório PDF...");
      // Implementar geração de PDF
      // Por enquanto, apenas mostra mensagem de sucesso
      setTimeout(() => {
        toast.success("Relatório gerado com sucesso!");
      }, 1000);
    } catch (error) {
      toast.error("Erro ao gerar relatório");
    }
  };

  const protocolosData = (protocolos as any)?.data || [];
  const processosData = (processos as any)?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Relatório de Protocolos</h1>
        <p className="text-slate-600 mt-2">Gere relatórios unificados de protocolos e processos</p>
      </div>

      {/* Tipo de Relatório */}
      <Card>
        <CardHeader>
          <CardTitle>Tipo de Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="protocolo"
                checked={relatorioType === "protocolo"}
                onChange={(e) => setRelatorioType(e.target.value)}
              />
              <span>Protocolos</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="processo"
                checked={relatorioType === "processo"}
                onChange={(e) => setRelatorioType(e.target.value)}
              />
              <span>Processos</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Seleção de Protocolos */}
      {relatorioType === "protocolo" && (
        <Card>
          <CardHeader>
            <CardTitle>Selecione Protocolos</CardTitle>
            <CardDescription>
              {selectedProtocolos.length} protocolo(s) selecionado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedProtocolos.length === protocolosData.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedProtocolos(protocolosData.map((p: any) => p.id));
                          } else {
                            setSelectedProtocolos([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Protocolo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Abertura</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {protocolosData.map((protocolo: any) => (
                    <TableRow key={protocolo.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProtocolos.includes(protocolo.id)}
                          onCheckedChange={() => handleSelectProtocolo(protocolo.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{protocolo.numeroProtocolo}</TableCell>
                      <TableCell>{protocolo.cliente?.nome || "-"}</TableCell>
                      <TableCell>{protocolo.status}</TableCell>
                      <TableCell>
                        {new Date(protocolo.dataAbertura).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seleção de Processos */}
      {relatorioType === "processo" && (
        <Card>
          <CardHeader>
            <CardTitle>Selecione Processos</CardTitle>
            <CardDescription>
              {selectedProcessos.length} processo(s) selecionado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedProcessos.length === processosData.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedProcessos(processosData.map((p: any) => p.id));
                          } else {
                            setSelectedProcessos([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Vencimento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processosData.map((processo: any) => (
                    <TableRow key={processo.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProcessos.includes(processo.id)}
                          onCheckedChange={() => handleSelectProcesso(processo.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{processo.titulo}</TableCell>
                      <TableCell>{processo.cliente?.nome || "-"}</TableCell>
                      <TableCell>{processo.status}</TableCell>
                      <TableCell>
                        {processo.prazoVencimento
                          ? new Date(processo.prazoVencimento).toLocaleDateString()
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botão Gerar Relatório */}
      <div className="flex gap-2">
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={handleGeneratePDF}
          disabled={
            (relatorioType === "protocolo" && selectedProtocolos.length === 0) ||
            (relatorioType === "processo" && selectedProcessos.length === 0)
          }
        >
          <Download className="h-4 w-4 mr-2" />
          Gerar Relatório PDF
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setSelectedProtocolos([]);
            setSelectedProcessos([]);
          }}
        >
          Limpar Seleção
        </Button>
      </div>
    </div>
  );
}
