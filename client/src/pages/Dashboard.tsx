import { AlertCircle, CheckCircle2, Clock, FileText, Hourglass, ExternalLink, MapPin, Briefcase } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();
  const { data: processos } = trpc.processos.list.useQuery();
  const { data: clientes } = trpc.clientes.list.useQuery();

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
    {
      title: "Campo",
      value: stats?.campo || 0,
      icon: MapPin,
      color: "bg-red-50 text-red-600",
      borderColor: "border-red-200",
    },
    {
      title: "Análise/Escritório",
      value: stats?.analiseEscritorio || 0,
      icon: Briefcase,
      color: "bg-indigo-50 text-indigo-600",
      borderColor: "border-indigo-200",
    },
    {
      title: "Pendente Documento",
      value: stats?.pendenteDocumento || 0,
      icon: AlertCircle,
      color: "bg-yellow-50 text-yellow-600",
      borderColor: "border-yellow-200",
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
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

      {/* Atividades Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Clientes Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Clientes Recentes</CardTitle>
            <CardDescription>Últimos clientes cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            {clientes && clientes.length > 0 ? (
              <div className="space-y-2">
                {clientes.slice(0, 5).map((cliente) => (
                  <div key={cliente.id} className="text-sm p-2 bg-slate-50 rounded border-l-2 border-blue-500">
                    <p className="font-medium text-slate-900">{cliente.nome}</p>
                    <p className="text-xs text-slate-600">{cliente.cpfCnpj}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600">Nenhum cliente cadastrado</p>
            )}
          </CardContent>
        </Card>

        {/* Processos Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Processos Recentes</CardTitle>
            <CardDescription>Últimos processos criados</CardDescription>
          </CardHeader>
          <CardContent>
            {processos && processos.length > 0 ? (
              <div className="space-y-2">
                {processos.slice(0, 5).map((processo) => (
                  <div key={processo.id} className="text-sm p-2 bg-slate-50 rounded border-l-2 border-purple-500">
                    <p className="font-medium text-slate-900">{processo.titulo}</p>
                    <p className="text-xs text-slate-600">{processo.cliente?.nome}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600">Nenhum processo cadastrado</p>
            )}
          </CardContent>
        </Card>
      </div>

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
