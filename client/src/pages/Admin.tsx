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
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<number | null>(null);

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

  // Obter lista de todos os usuários
  const getAllUsersQuery = trpc.permissions.getAllUsers.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  
  const usuariosComNomes = (getAllUsersQuery.data || []).map((user) => ({
    id: user.id,
    nome: user.username || `Usuário ${user.id}`,
  }));
  
  // Obter lista de usuários únicos com nomes (para auditoria)
  const usuariosUnicos = Array.from(new Set(auditoria.map((a) => a.usuarioId)));
  const usuariosAuditoriaComNomes = usuariosUnicos.map((id) => {
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="usuarios">Histórico por Usuário</TabsTrigger>
          <TabsTrigger value="processos">Histórico por Processo</TabsTrigger>
          <TabsTrigger value="permissoes">Permissões</TabsTrigger>
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
            Usuários com ações: {usuariosAuditoriaComNomes.map((u) => u.nome).join(", ") || "Nenhum"}
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

        <TabsContent value="permissoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Permissões de Usuários</CardTitle>
              <CardDescription>Configure as permissões para cada usuário</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Selecione um usuário:</label>
                <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-2">
                  {usuariosComNomes.map((usuario) => (
                    <button
                      key={usuario.id}
                      onClick={() => setSelectedUserForPermissions(usuario.id)}
                      className={`w-full text-left px-4 py-2 rounded-lg border-2 transition-colors ${
                        selectedUserForPermissions === usuario.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {usuario.nome}
                    </button>
                  ))}
                </div>
              </div>
              {selectedUserForPermissions && (
                <PermissionsManager userId={selectedUserForPermissions} userName={usuariosComNomes.find(u => u.id === selectedUserForPermissions)?.nome || ""} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PermissionsManager({ userId, userName }: { userId: number; userName: string }) {
  const [permissions, setPermissions] = useState({
    canCreateClient: false,
    canEditProcess: false,
    canDeleteProcess: false,
    canViewCalendar: false,
    canViewProcesses: false,
    canViewClients: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  const getPermissionsQuery = trpc.permissions.getUserPermissions.useQuery(
    { userId }
  );

  useEffect(() => {
    if (getPermissionsQuery.data) {
      setPermissions(getPermissionsQuery.data);
    }
  }, [getPermissionsQuery.data]);

  const updatePermissionsMutation = trpc.permissions.updateUserPermissions.useMutation({
    onSuccess: () => {
      void getPermissionsQuery.refetch();
      setIsSaving(false);
    },
  });

  const handlePermissionChange = (permission: keyof typeof permissions) => {
    setPermissions((prev) => ({
      ...prev,
      [permission]: !prev[permission],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updatePermissionsMutation.mutateAsync({
      userId,
      ...permissions,
    });
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-lg">{userName}</CardTitle>
        <CardDescription>Permissões do usuário</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-blue-100 transition-colors">
            <input
              type="checkbox"
              checked={permissions.canViewClients}
              onChange={() => handlePermissionChange("canViewClients")}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Ver Aba de Clientes</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-blue-100 transition-colors">
            <input
              type="checkbox"
              checked={permissions.canCreateClient}
              onChange={() => handlePermissionChange("canCreateClient")}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Criar Cadastro de Cliente</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-blue-100 transition-colors">
            <input
              type="checkbox"
              checked={permissions.canViewProcesses}
              onChange={() => handlePermissionChange("canViewProcesses")}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Ver Aba de Processos</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-blue-100 transition-colors">
            <input
              type="checkbox"
              checked={permissions.canEditProcess}
              onChange={() => handlePermissionChange("canEditProcess")}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Editar Processo</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-blue-100 transition-colors">
            <input
              type="checkbox"
              checked={permissions.canDeleteProcess}
              onChange={() => handlePermissionChange("canDeleteProcess")}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Excluir Processo</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-blue-100 transition-colors">
            <input
              type="checkbox"
              checked={permissions.canViewCalendar}
              onChange={() => handlePermissionChange("canViewCalendar")}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Ver Aba de Calendário</span>
          </label>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving || updatePermissionsMutation.isPending}
          className="w-full mt-4"
        >
          {isSaving ? "Salvando..." : "Salvar Permissões"}
        </Button>
      </CardContent>
    </Card>
  );
}
