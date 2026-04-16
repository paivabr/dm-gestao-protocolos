import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Lock, Mail, Link as LinkIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export default function Perfil() {
  const { user } = useAuth();
  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(false);
  
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState(user?.fotoPerfil || "");
  const [fotoPerfilTemp, setFotoPerfilTemp] = useState<string>("");

  const updateProfileMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: (data: any) => {
      toast.success("Perfil atualizado com sucesso!");
      setEditingName(false);
      setEditingEmail(false);
      setEditingPhoto(false);
      setFotoPerfilTemp("");
      // Update the fotoPerfil state with the returned URL
      if (data.fotoPerfil) {
        setFotoPerfil(data.fotoPerfil);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar perfil");
    },
  });

  const updatePasswordMutation = trpc.auth.updatePassword.useMutation({
    onSuccess: () => {
      toast.success("Senha alterada com sucesso!");
      setEditingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao alterar senha");
    },
  });

  const handleUpdateName = async () => {
    if (!name.trim()) {
      toast.error("Nome não pode estar vazio");
      return;
    }
    await updateProfileMutation.mutateAsync({ name });
  };

  const handleUpdateEmail = async () => {
    if (!email.trim()) {
      toast.error("Email não pode estar vazio");
      return;
    }
    await updateProfileMutation.mutateAsync({ email });
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Preencha todos os campos");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    await updatePasswordMutation.mutateAsync({ currentPassword, newPassword });
  };

  const handleSavePhoto = async () => {
    if (!fotoPerfilTemp.trim()) {
      toast.error("Cole um link válido");
      return;
    }

    // Validar se é uma URL válida
    try {
      new URL(fotoPerfilTemp);
    } catch {
      toast.error("URL inválida. Verifique o link");
      return;
    }

    await updateProfileMutation.mutateAsync({ fotoPerfil: fotoPerfilTemp });
  };

  const handleCancelPhoto = () => {
    setFotoPerfilTemp("");
    setEditingPhoto(false);
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
              <AvatarImage src={fotoPerfilTemp || fotoPerfil || ""} alt={user.name || "Foto de perfil"} />
              <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              {!editingPhoto ? (
                <>
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => setEditingPhoto(true)}
                  >
                    <LinkIcon className="h-4 w-4" />
                    Alterar Foto
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">Cole o link da sua foto (PNG, JPG, GIF, etc)</p>
                </>
              ) : (
                <div className="space-y-3">
                  <Input
                    type="url"
                    placeholder="https://exemplo.com/foto.jpg"
                    value={fotoPerfilTemp}
                    onChange={(e) => setFotoPerfilTemp(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">Cole a URL completa da imagem</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSavePhoto}
                      disabled={updateProfileMutation.isPending || !fotoPerfilTemp.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Salvar Foto
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelPhoto}
                      disabled={updateProfileMutation.isPending}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
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
            <div className="space-y-3">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleUpdateName}
                  disabled={updateProfileMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Salvar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingName(false);
                    setName(user?.name || "");
                  }}
                  disabled={updateProfileMutation.isPending}
                >
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
            <div className="space-y-3">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleUpdateEmail}
                  disabled={updateProfileMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Salvar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingEmail(false);
                    setEmail(user?.email || "");
                  }}
                  disabled={updateProfileMutation.isPending}
                >
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
          <CardDescription>Altere sua senha</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!editingPassword ? (
            <Button
              variant="outline"
              onClick={() => setEditingPassword(true)}
            >
              Alterar Senha
            </Button>
          ) : (
            <div className="space-y-3">
              <Input
                type="password"
                placeholder="Senha atual"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Nova senha"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Confirme a nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleUpdatePassword}
                  disabled={updatePasswordMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Salvar Senha
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingPassword(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  disabled={updatePasswordMutation.isPending}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
