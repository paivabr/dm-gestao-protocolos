import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Admin() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [selectedTab, setSelectedTab] = useState("usuarios");
  const [filterUsuarioId, setFilterUsuarioId] = useState<string>("");
  const [filterUsuarioNome, setFilterUsuarioNome] = useState<string>("");
  const [filterProcessoId, setFilterProcessoId] = useState<string>("");

  const auditoriaQuery = trpc.auditoria.getAll.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/dashboard");
    }
  }, [user]);

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              Acesso Negado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">Apenas administradores podem acessar esta página.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const auditoria = auditoriaQuery.data || [];

  // Agrupar auditoria por usuário
  const auditoriaByUsuario = auditoria.reduce((acc, item) => {
    if (!acc[item.usuarioId]) {
      acc[item.usuarioId] = [];
    }
    acc[item.usuarioId].push(item);
    return acc;
  }, {} as Record<number, typeof auditoria>);

  // Agrupar auditoria por processo
  const auditoriaByProcesso = auditoria
    .filter((item) => item.tabela === "processos")
    .reduce((acc, item) => {
      if (!acc[item.registroId]) {
        acc[item.registroId] = [];
      }
      acc[item.registroId].push(item);
      return acc;
    }, {} as Record<number, typeof auditoria>);

  // Filtrar por usuário
  const filteredByUsuario = filterUsuarioId
    ? { [filterUsuarioId]: auditoriaByUsuario[parseInt(filterUsuarioId)] || [] }
    : auditoriaByUsuario;

  // Filtrar por processo
  const filteredByProcesso = filterProcessoId
    ? { [filterProcessoId]: auditoriaByProcesso[parseInt(filterProcessoId)] || [] }
    : auditoriaByProcesso;

  // Obter lista de usuários únicos com nomes
  const usuariosUnicos = Array.from(new Set(auditoria.map((a) => a.usuarioId)));
  const usuariosComNomes = usuariosUnicos.map((id) => {
    const item = auditoria.find((a) => a.usuarioId === id);
    return {
      id,
      nome: item?.nomeUsuario || `Usuário ${id}`,
    };
  });
  const processosUnicos = Array.from(new Set(auditoria.filter((a) => a.tabela === "processos").map((a) => a.registroId)));

  // Filtrar por nome de usuário
  const auditoriaFiltrada = filterUsuarioNome
    ? auditoria.filter((a) => a.nomeUsuario?.toLowerCase().includes(filterUsuarioNome.toLowerCase()))
    : auditoria;

  // Agrupar auditoria filtrada por usuário
  const auditoriaByUsuarioFiltrada = auditoriaFiltrada.reduce((acc, item) => {
    if (!acc[item.usuarioId]) {
      acc[item.usuarioId] = [];
    }
    acc[item.usuarioId].push(item);
    return acc;
  }, {} as Record<number, typeof auditoria>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Administração</h1>
        <p className="text-gray-600 mt-2">Gerenciar usuários e histórico de edições</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="usuarios">Histórico por Usuário</TabsTrigger>
          <TabsTrigger value="processos">Histórico por Processo</TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios" className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Filtrar por nome do usuário..."
              value={filterUsuarioNome}
              onChange={(e) => setFilterUsuarioNome(e.target.value)}
            />
            {filterUsuarioNome && (
              <Button
                variant="outline"
                onClick={() => setFilterUsuarioNome("")}
              >
                Limpar
              </Button>
            )}
          </div>
          <div className="text-sm text-gray-600 mb-4">
            Usuários com ações: {usuariosComNomes.map((u) => u.nome).join(", ") || "Nenhum"}
          </div>
          {Object.entries(filterUsuarioNome ? auditoriaByUsuarioFiltrada : filteredByUsuario).map(([usuarioId, items]) => {
            const nomeUsuario = usuariosComNomes.find((u) => u.id === parseInt(usuarioId))?.nome || `Usuário ${usuarioId}`;
            return (
              <Card key={usuarioId}>
                <CardHeader>
                  <CardTitle className="text-lg">{nomeUsuario}</CardTitle>
                  <CardDescription>{items.length} ações registradas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {item.acao.charAt(0).toUpperCase() + item.acao.slice(1)} - {item.tabela}
                            </p>
                            <p className="text-sm text-gray-600">
                              Registro ID: {item.registroId}
                            </p>
                            {item.alteracoes && (
                              <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">
                                {item.alteracoes}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                            {new Date(item.criadoEm).toLocaleString("pt-BR")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="processos" className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Filtrar por ID do processo..."
              value={filterProcessoId}
              onChange={(e) => setFilterProcessoId(e.target.value)}
              type="number"
            />
            {filterProcessoId && (
              <Button
                variant="outline"
                onClick={() => setFilterProcessoId("")}
              >
                Limpar
              </Button>
            )}
          </div>
          <div className="text-sm text-gray-600 mb-4">
            Processos com alterações: {processosUnicos.join(", ") || "Nenhum"}
          </div>
          {Object.entries(filteredByProcesso).map(([processoId, items]) => (
            <Card key={processoId}>
              <CardHeader>
                <CardTitle className="text-lg">Processo ID: {processoId}</CardTitle>
                <CardDescription>{items.length} alterações registradas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="border-l-4 border-green-500 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {item.acao.charAt(0).toUpperCase() + item.acao.slice(1)} por Usuário {item.usuarioId}
                          </p>
                          {item.alteracoes && (
                            <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">
                              {item.alteracoes}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                          {new Date(item.criadoEm).toLocaleString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
