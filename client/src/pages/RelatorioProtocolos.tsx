import { useState, useMemo } from "react";
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
  const [filterNumero, setFilterNumero] = useState("");
  const [filterNome, setFilterNome] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: protocolos = [] } = trpc.statusProtocolo.listPaginated.useQuery({
    page: 1,
    limit: 100,
    includeArchived: true,
  });

  const { data: processos = [] } = trpc.processos.listPaginated.useQuery({
    page: 1,
    limit: 100,
    includeArchived: true,
  });

  const gerarProtocolosPDF = trpc.relatorio.gerarProtocolosPDF.useMutation();
  const gerarProcessosPDF = trpc.relatorio.gerarProcessosPDF.useMutation();

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

    setIsGenerating(true);
    try {
      if (relatorioType === "protocolo") {
        const result = await gerarProtocolosPDF.mutateAsync({
          protocoloIds: selectedProtocolos,
        });

        if (result.success && result.pdf) {
          const binaryString = atob(result.pdf);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: "application/pdf" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = result.filename || `relatorio-protocolos-${new Date().toISOString().split("T")[0]}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          toast.success("Relatório PDF gerado e baixado com sucesso!");
        } else {
          toast.error("Erro ao gerar relatório PDF");
        }
      } else {
        const result = await gerarProcessosPDF.mutateAsync({
          processoIds: selectedProcessos,
        });

        if (result.success && result.pdf) {
          // Convert base64 to blob and download
          const binaryString = atob(result.pdf);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: "application/pdf" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = result.filename || `relatorio-processos-${new Date().toISOString().split("T")[0]}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          toast.success("Relatório PDF gerado e baixado com sucesso!");
        } else {
          toast.error("Erro ao gerar relatório PDF");
        }
      }
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar relatório PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const protocolosData = (protocolos as any)?.data || [];
  const processosData = (processos as any)?.data || [];

  // Filtrar dados
  const protocolosFiltrados = useMemo(() => {
    return protocolosData.filter((p: any) => {
      const matchNumero = !filterNumero || (p.numeroProtocolo && p.numeroProtocolo.toString().includes(filterNumero));
      const matchNome = !filterNome || (p.cliente?.nome && p.cliente.nome.toLowerCase().includes(filterNome.toLowerCase()));
      return matchNumero && matchNome;
    });
  }, [protocolosData, filterNumero, filterNome]);

  const processosFiltrados = useMemo(() => {
    return processosData.filter((p: any) => {
      const matchNumero = !filterNumero || (p.id && p.id.toString().includes(filterNumero));
      const matchNome = !filterNome || (p.titulo && p.titulo.toLowerCase().includes(filterNome.toLowerCase())) || (p.cliente?.nome && p.cliente.nome.toLowerCase().includes(filterNome.toLowerCase()));
      return matchNumero && matchNome;
    });
  }, [processosData, filterNumero, filterNome]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Relatório de Protocolos</h1>
        <p className="text-slate-600 mt-2">Gere relatórios unificados de protocolos e processos com dados financeiros</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Número do Processo/Protocolo</label>
              <input
                type="text"
                placeholder="Buscar por número..."
                value={filterNumero}
                onChange={(e) => setFilterNumero(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nome do Cliente</label>
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={filterNome}
                onChange={(e) => setFilterNome(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>
          </div>
        </CardContent>
      </Card>

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
                        checked={selectedProtocolos.length === protocolosFiltrados.length && protocolosFiltrados.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedProtocolos(protocolosFiltrados.map((p: any) => p.id));
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
                  {protocolosFiltrados.map((protocolo: any) => (
                    <TableRow key={protocolo.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProtocolos.includes(protocolo.id)}
                          onCheckedChange={() => handleSelectProtocolo(protocolo.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {protocolo.numeroProtocolo}
                        {protocolo.isArchived === 1 && (
                          <span className="ml-2 px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded-full">
                            Arquivado
                          </span>
                        )}
                      </TableCell>
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
                        checked={selectedProcessos.length === processosFiltrados.length && processosFiltrados.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedProcessos(processosFiltrados.map((p: any) => p.id));
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
                  {processosFiltrados.map((processo: any) => (
                    <TableRow key={processo.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProcessos.includes(processo.id)}
                          onCheckedChange={() => handleSelectProcesso(processo.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {processo.titulo}
                        {processo.isArchived === 1 && (
                          <span className="ml-2 px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded-full">
                            Arquivado
                          </span>
                        )}
                      </TableCell>
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
            isGenerating ||
            (relatorioType === "protocolo" && selectedProtocolos.length === 0) ||
            (relatorioType === "processo" && selectedProcessos.length === 0)
          }
        >
          <Download className="h-4 w-4 mr-2" />
          {isGenerating ? "Gerando..." : "Gerar Relatório PDF"}
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
