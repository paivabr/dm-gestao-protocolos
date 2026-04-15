import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Upload, Lock, Mail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const useToast = () => ({
  toast: ({ title, description, variant }: any) => {
    console.log(`${title}: ${description}`);
  },
});

export default function Perfil() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState(user?.fotoPerfil || "");

  const updateProfileMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Perfil atualizado com sucesso!" });
      setEditingName(false);
      setEditingEmail(false);
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message || "Erro ao atualizar perfil", variant: "destructive" });
    },
  });

  const updatePasswordMutation = trpc.auth.updatePassword.useMutation({
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Senha alterada com sucesso!" });
      setEditingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message || "Erro ao alterar senha", variant: "destructive" });
    },
  });

  const handleUpdateName = async () => {
    if (!name.trim()) {
      toast({ title: "Erro", description: "Nome não pode estar vazio", variant: "destructive" });
      return;
    }
    await updateProfileMutation.mutateAsync({ name });
  };

  const handleUpdateEmail = async () => {
    if (!email.trim()) {
      toast({ title: "Erro", description: "Email não pode estar vazio", variant: "destructive" });
      return;
    }
    await updateProfileMutation.mutateAsync({ email });
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: "Erro", description: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Erro", description: "As senhas não coincidem", variant: "destructive" });
      return;
    }
    await updatePasswordMutation.mutateAsync({ currentPassword, newPassword });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setFotoPerfil(base64);
      await updateProfileMutation.mutateAsync({ fotoPerfil: base64 });
    };
    reader.readAsDataURL(file);
  };

  if (!user) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-gray-600 mt-2">Gerencie suas informações pessoais e segurança</p>
      </div>

      {/* Foto de Perfil */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Foto de Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={fotoPerfil || undefined} />
              <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <label htmlFor="photo-upload" className="cursor-pointer">
                <Button variant="outline" className="gap-2" asChild>
                  <span>
                    <Upload className="h-4 w-4" />
                    Alterar Foto
                  </span>
                </Button>
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
              <p className="text-xs text-gray-500 mt-2">PNG, JPG até 5MB</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nome */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Nome
          </CardTitle>
          <CardDescription>Seu nome completo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!editingName ? (
            <div className="flex items-center justify-between">
              <p className="text-lg">{name || "Não informado"}</p>
              <Button variant="outline" onClick={() => setEditingName(true)}>
                Editar
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
              />
              <div className="flex gap-2">
                <Button onClick={handleUpdateName} disabled={updateProfileMutation.isPending}>
                  Salvar
                </Button>
                <Button variant="outline" onClick={() => setEditingName(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email
          </CardTitle>
          <CardDescription>Seu endereço de email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!editingEmail ? (
            <div className="flex items-center justify-between">
              <p className="text-lg">{email || "Não informado"}</p>
              <Button variant="outline" onClick={() => setEditingEmail(true)}>
                Editar
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
              />
              <div className="flex gap-2">
                <Button onClick={handleUpdateEmail} disabled={updateProfileMutation.isPending}>
                  Salvar
                </Button>
                <Button variant="outline" onClick={() => setEditingEmail(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alterar Senha */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Segurança
          </CardTitle>
          <CardDescription>Altere sua senha regularmente para manter sua conta segura</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!editingPassword ? (
            <Button variant="outline" onClick={() => setEditingPassword(true)}>
              Alterar Senha
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Senha Atual</label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Nova Senha</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite sua nova senha"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Confirmar Nova Senha</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua nova senha"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdatePassword} disabled={updatePasswordMutation.isPending}>
                  Salvar Senha
                </Button>
                <Button variant="outline" onClick={() => setEditingPassword(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações da Conta */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Usuário:</span>
            <span className="font-medium">{user.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Função:</span>
            <span className="font-medium">{user.role === "admin" ? "Administrador" : "Usuário"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Membro desde:</span>
            <span className="font-medium">{new Date(user.createdAt).toLocaleDateString("pt-BR")}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
