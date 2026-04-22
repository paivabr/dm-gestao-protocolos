import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { TRPCError } from "@trpc/server";

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

  const getAllUsersQuery = trpc.permissions.getAllUsers.useQuery();
  const deletarUsuarioMutation = trpc.permissions.deleteUser.useMutation({
    onSuccess: () => {
      toast.success("Usuário excluído com sucesso!");
      void getAllUsersQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir usuário");
    },
  });

  const promoteToAdminMutation = trpc.permissions.promoteToAdmin.useMutation({
    onSuccess: () => {
      toast.success("Usuário promovido a administrador!");
      void getAllUsersQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao promover usuário");
    },
  });

  const demoteFromAdminMutation = trpc.permissions.demoteFromAdmin.useMutation({
    onSuccess: () => {
      toast.success("Usuário rebaixado para usuário comum!");
      void getAllUsersQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao rebaixar usuário");
    },
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
  const auditoriaAgrupada = auditoria.reduce(
    (acc, item) => {
      if (!acc[item.nomeUsuario]) {
        acc[item.nomeUsuario] = [];
      }
      acc[item.nomeUsuario].push(item);
      return acc;
    },
    {} as Record<string, typeof auditoria>
  );

  const usuariosComNomes = getAllUsersQuery.data || [];

  // Filtrar auditoria por usuário
  const auditoriaFiltrada = filterUsuarioNome
    ? auditoria.filter((item) =>
        item.nomeUsuario.toLowerCase().includes(filterUsuarioNome.toLowerCase())
      )
    : auditoria;

  // Filtrar auditoria por processo
  const auditoriaFiltradaPorProcesso = filterProcessoId
    ? auditoria.filter((item) => item.registroId?.toString() === filterProcessoId)
    : auditoria;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Administração</h1>
        <p className="text-gray-600 mt-2">Gerenciar usuários e histórico de edições</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="usuarios">Histórico por Usuário</TabsTrigger>
          <TabsTrigger value="processos">Histórico por Processo</TabsTrigger>
          <TabsTrigger value="permissoes">Permissões</TabsTrigger>
          <TabsTrigger value="gerenciar">Gerenciar Usuários</TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico por Usuário</CardTitle>
              <CardDescription>Filtre o histórico de edições por usuário</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Buscar por nome do usuário..."
                value={filterUsuarioNome}
                onChange={(e) => setFilterUsuarioNome(e.target.value)}
              />
              <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-2">
                {auditoriaFiltrada.map((item) => (
                  <div key={item.id} className="p-3 border rounded-lg text-sm">
                    <p className="font-medium text-gray-900">{item.nomeUsuario}</p>
                    <p className="text-gray-600">{item.acao} em {item.tabela}</p>
                    <p className="text-gray-500 text-xs">{new Date(item.criadoEm).toLocaleString()}</p>
                    {item.alteracoes && <p className="text-gray-600 text-xs mt-1">{item.alteracoes}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico por Processo</CardTitle>
              <CardDescription>Filtre o histórico de edições por processo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Buscar por ID do processo..."
                value={filterProcessoId}
                onChange={(e) => setFilterProcessoId(e.target.value)}
              />
              <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-2">
                {auditoriaFiltradaPorProcesso.map((item) => (
                  <div key={item.id} className="p-3 border rounded-lg text-sm">
                    <p className="font-medium text-gray-900">{item.nomeUsuario}</p>
                    <p className="text-gray-600">{item.acao} em {item.tabela} (ID: {item.registroId})</p>
                    <p className="text-gray-500 text-xs">{new Date(item.criadoEm).toLocaleString()}</p>
                    {item.alteracoes && <p className="text-gray-600 text-xs mt-1">{item.alteracoes}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Permissões</CardTitle>
              <CardDescription>Selecione um usuário para gerenciar suas permissões</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    {usuario.name || usuario.username}
                  </button>
                ))}
              </div>
              {selectedUserForPermissions && (
                <PermissionsManager userId={selectedUserForPermissions} userName={usuariosComNomes.find(u => u.id === selectedUserForPermissions)?.name || usuariosComNomes.find(u => u.id === selectedUserForPermissions)?.username || ""} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gerenciar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Usuários</CardTitle>
              <CardDescription>Promova, rebaixe ou exclua usuários do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-2">
                {usuariosComNomes.map((usuario) => (
                  <div key={usuario.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">{usuario.name || usuario.username}</span>
                      <span className={`text-xs px-2 py-1 rounded ${usuario.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                        {usuario.role === 'admin' ? 'Admin' : 'Usuário'}
                      </span>
                    </div>
                    {usuario.id !== user?.id && (
                      <div className="flex gap-2">
                        {usuario.role !== 'admin' ? (
                          <Button
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700"
                            onClick={() => {
                              if (window.confirm(`Promover ${usuario.name || usuario.username} a administrador?`)) {
                                promoteToAdminMutation.mutate({ userId: usuario.id });
                              }
                            }}
                            disabled={promoteToAdminMutation.isPending}
                          >
                            Promover
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-yellow-600 hover:bg-yellow-700"
                            onClick={() => {
                              if (window.confirm(`Rebaixar ${usuario.name || usuario.username} para usuário comum?`)) {
                                demoteFromAdminMutation.mutate({ userId: usuario.id });
                              }
                            }}
                            disabled={demoteFromAdminMutation.isPending}
                          >
                            Rebaixar
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (window.confirm(`Tem certeza que deseja excluir ${usuario.name || usuario.username}? Esta ação não pode ser desfeita.`)) {
                              deletarUsuarioMutation.mutate({ userId: usuario.id });
                            }
                          }}
                          disabled={deletarUsuarioMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </Button>
                      </div>
                    )}
                    {usuario.id === user?.id && (
                      <span className="text-xs text-gray-500">Você não pode alterar sua própria conta</span>
                    )}
                  </div>
                ))}
              </div>
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
    canManageParcelas: false,
    canViewArchivo: false,
    canViewDespesas: false,
    canViewRelatorio: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  const getPermissionsQuery = trpc.permissions.getUserPermissions.useQuery(
    { userId }
  );

  useEffect(() => {
    if (getPermissionsQuery.data) {
      setPermissions({
        ...getPermissionsQuery.data,
        canViewArchivo: getPermissionsQuery.data.canViewArchivo ?? false,
        canViewDespesas: getPermissionsQuery.data.canViewDespesas ?? false,
        canViewRelatorio: getPermissionsQuery.data.canViewRelatorio ?? false,
      });
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
            <span className="text-sm font-medium">Deletar Processo</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-blue-100 transition-colors">
            <input
              type="checkbox"
              checked={permissions.canViewCalendar}
              onChange={() => handlePermissionChange("canViewCalendar")}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Ver Calendário</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-blue-100 transition-colors">
            <input
              type="checkbox"
              checked={permissions.canManageParcelas}
              onChange={() => handlePermissionChange("canManageParcelas")}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Gerenciar Parcelas</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-blue-100 transition-colors">
            <input
              type="checkbox"
              checked={permissions.canViewArchivo}
              onChange={() => handlePermissionChange("canViewArchivo")}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Ver Arquivo</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-blue-100 transition-colors">
            <input
              type="checkbox"
              checked={permissions.canViewDespesas}
              onChange={() => handlePermissionChange("canViewDespesas")}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Ver Custas/Despesas</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-blue-100 transition-colors">
            <input
              type="checkbox"
              checked={permissions.canViewRelatorio}
              onChange={() => handlePermissionChange("canViewRelatorio")}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Ver Relatório</span>
          </label>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isSaving ? "Salvando..." : "Salvar Permissões"}
        </Button>
      </CardContent>
    </Card>
  );
}
