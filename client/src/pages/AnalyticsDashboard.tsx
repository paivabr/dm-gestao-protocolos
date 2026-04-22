import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

export default function AnalyticsDashboard() {
  const { data: protocolos = [] } = trpc.statusProtocolo.listPaginated.useQuery({
    page: 1,
    limit: 100,
  });

  const { data: processos = [] } = trpc.processos.listPaginated.useQuery({
    page: 1,
    limit: 100,
  });

  const { data: clientes = [] } = trpc.clientes.list.useQuery();

  const protocolosData = (protocolos as any)?.data || [];
  const processosData = (processos as any)?.data || [];
  const clientesData = clientes || [];

  // Estatísticas de Protocolos
  const stats = useMemo(() => {
    const total = protocolosData.length;
    const pronto = protocolosData.filter((p: any) => p.status === "Pronto").length;
    const reingressado = protocolosData.filter((p: any) => p.status === "Reingressado").length;
    const protocolado = protocolosData.filter((p: any) => p.status === "Protocolado").length;
    const vencido = protocolosData.filter((p: any) => p.status === "Vencido").length;

    return { total, pronto, reingressado, protocolado, vencido };
  }, [protocolosData]);

  // Estatísticas de Processos
  const processStats = useMemo(() => {
    const total = processosData.length;
    const pendente = processosData.filter((p: any) => p.status === "Pendente").length;
    const emAnalise = processosData.filter((p: any) => p.status === "Em Análise").length;
    const protocolado = processosData.filter((p: any) => p.status === "Protocolado").length;
    const finalizado = processosData.filter((p: any) => p.status === "Finalizado").length;

    return { total, pendente, emAnalise, protocolado, finalizado };
  }, [processosData]);

  // Clientes mais ativos
  const topClientes = useMemo(() => {
    const clienteMap = new Map<number, number>();
    protocolosData.forEach((p: any) => {
      if (p.clienteId) {
        clienteMap.set(p.clienteId, (clienteMap.get(p.clienteId) || 0) + 1);
      }
    });

    return Array.from(clienteMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([clienteId, count]) => {
        const cliente = clientesData.find((c: any) => c.id === clienteId);
        return { nome: cliente?.nome || "Desconhecido", count };
      });
  }, [protocolosData, clientesData]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard de Análise</h1>
        <p className="text-slate-600 mt-2">Visão geral do sistema de gestão de protocolos</p>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total de Protocolos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-slate-500 mt-1">protocolos cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Prontos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.pronto}</div>
            <p className="text-xs text-slate-500 mt-1">aguardando protocolo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-600">Reingressados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.reingressado}</div>
            <p className="text-xs text-slate-500 mt-1">com problemas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Protocolados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.protocolado}</div>
            <p className="text-xs text-slate-500 mt-1">já protocolados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Vencidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.vencido}</div>
            <p className="text-xs text-slate-500 mt-1">com prazo vencido</p>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas de Processos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total de Processos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processStats.total}</div>
            <p className="text-xs text-slate-500 mt-1">processos cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{processStats.pendente}</div>
            <p className="text-xs text-slate-500 mt-1">aguardando ação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Em Análise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{processStats.emAnalise}</div>
            <p className="text-xs text-slate-500 mt-1">sendo analisados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Protocolados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{processStats.protocolado}</div>
            <p className="text-xs text-slate-500 mt-1">já protocolados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600">Finalizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{processStats.finalizado}</div>
            <p className="text-xs text-slate-500 mt-1">concluídos</p>
          </CardContent>
        </Card>
      </div>

      {/* Clientes Mais Ativos */}
      <Card>
        <CardHeader>
          <CardTitle>Clientes Mais Ativos</CardTitle>
          <CardDescription>Top 5 clientes com mais protocolos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topClientes.length > 0 ? (
              topClientes.map((cliente, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                      {index + 1}
                    </div>
                    <span className="font-medium text-slate-900">{cliente.nome}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">{cliente.count}</div>
                    <div className="text-xs text-slate-500">protocolo(s)</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-600">
                Nenhum dado disponível
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Distribuição por Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Protocolos por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Pronto", value: stats.pronto, color: "bg-blue-500" },
                { label: "Reingressado", value: stats.reingressado, color: "bg-amber-500" },
                { label: "Protocolado", value: stats.protocolado, color: "bg-green-500" },
                { label: "Vencido", value: stats.vencido, color: "bg-red-500" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-sm font-bold">{item.value}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full`}
                      style={{ width: `${stats.total > 0 ? (item.value / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Processos por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Pendente", value: processStats.pendente, color: "bg-yellow-500" },
                { label: "Em Análise", value: processStats.emAnalise, color: "bg-blue-500" },
                { label: "Protocolado", value: processStats.protocolado, color: "bg-green-500" },
                { label: "Finalizado", value: processStats.finalizado, color: "bg-emerald-500" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-sm font-bold">{item.value}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full`}
                      style={{ width: `${processStats.total > 0 ? (item.value / processStats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
