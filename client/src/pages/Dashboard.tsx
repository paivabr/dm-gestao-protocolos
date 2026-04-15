import { AlertCircle, CheckCircle2, Clock, FileText, Hourglass, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();
  const { data: processos } = trpc.processos.list.useQuery();

  if (isLoading) {
    return <div className="p-6">Carregando...</div>;
  }

  const statCards = [
    {
      title: "Pendentes",
      value: stats?.pendentes || 0,
      icon: Clock,
      color: "bg-orange-50 text-orange-600",
      borderColor: "border-orange-200",
    },
    {
      title: "Em Análise",
      value: stats?.emAnalise || 0,
      icon: Hourglass,
      color: "bg-blue-50 text-blue-600",
      borderColor: "border-blue-200",
    },
    {
      title: "Protocolado",
      value: stats?.protocolado || 0,
      icon: FileText,
      color: "bg-purple-50 text-purple-600",
      borderColor: "border-purple-200",
    },
    {
      title: "Finalizado",
      value: stats?.finalizado || 0,
      icon: CheckCircle2,
      color: "bg-green-50 text-green-600",
      borderColor: "border-green-200",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Executivo</h1>
        <p className="text-slate-600 mt-2">
          Visão geral dos processos de regularização de imóveis
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className={`border-l-4 ${stat.borderColor}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${stat.color.split(" ")[1]}`} />
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${stat.color.split(" ")[1]}`}>
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alerts */}
      {stats?.vencendoHoje && stats.vencendoHoje > 0 && (
        <Card className="border-l-4 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              Atenção: Processos Vencendo Hoje
            </CardTitle>
            <CardDescription className="text-red-600">
              {stats.vencendoHoje} processo(s) vence(m) hoje. Verifique a seção de Processos para mais detalhes.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Latest Processes */}
      <Card>
        <CardHeader>
          <CardTitle>Últimos Processos Cadastrados</CardTitle>
          <CardDescription>
            Acompanhe os processos mais recentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {processos && processos.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Vencimento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processos.slice(0, 5).map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.titulo}</TableCell>
                      <TableCell>{p.cliente?.nome || "-"}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          p.status === "Pendente" ? "bg-orange-100 text-orange-800" :
                          p.status === "Em Análise" ? "bg-blue-100 text-blue-800" :
                          p.status === "Protocolado" ? "bg-purple-100 text-purple-800" :
                          "bg-green-100 text-green-800"
                        }`}>
                          {p.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {p.prazoVencimento
                          ? new Date(p.prazoVencimento).toLocaleDateString("pt-BR")
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {processos.length > 5 && (
                <div className="mt-4 text-center">
                  <Button
                    onClick={() => navigate("/processos")}
                    variant="outline"
                    className="gap-2"
                  >
                    Ver todos os processos
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-600">
              Nenhum processo cadastrado. Clique em "Processos" no menu para criar um novo.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo ao DM Gestão de Protocolos</CardTitle>
          <CardDescription>
            Sistema de gestão de processos de regularização imobiliária
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>
            • <strong>Gestão de Clientes:</strong> Cadastre e gerencie informações de clientes
          </p>
          <p>
            • <strong>Processos:</strong> Controle o fluxo de processos imobiliários (ITBI, Escrituras, etc.)
          </p>
          <p>
            • <strong>Checklists:</strong> Acompanhe documentos necessários para cada processo
          </p>
          <p>
            • <strong>Dashboard:</strong> Visualize estatísticas e alertas em tempo real
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
