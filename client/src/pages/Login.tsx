import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const DM_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663557675120/4ytvUVEtgZpREdobsNfbUD/dm-logo_b3d99471.jpg";

export default function Login() {
  const [, navigate] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
  });

  const utils = trpc.useUtils();
  const loginMutation = trpc.auth.login.useMutation();
  const registerMutation = trpc.auth.register.useMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await loginMutation.mutateAsync({
          username: formData.username,
          password: formData.password,
        });
        toast.success("Login realizado com sucesso!");
        // Invalidar cache do tRPC para forçar recarregamento do usuário
        await utils.auth.me.invalidate();
        // Aguardar um pouco para garantir que o cookie foi definido
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate("/");
      } else {
        await registerMutation.mutateAsync({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          name: formData.name,
        });
        toast.success("Conta criada com sucesso!");
        // Invalidar cache do tRPC para forçar recarregamento do usuário
        await utils.auth.me.invalidate();
        // Aguardar um pouco para garantir que o cookie foi definido
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate("/");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao processar solicitação";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={DM_LOGO} alt="DM Engenharia" className="h-32 w-32 rounded-full shadow-lg" />
        </div>

        {/* Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="text-2xl">
              {isLogin ? "DM Gestão de Protocolos" : "Criar Conta"}
            </CardTitle>
            <CardDescription className="text-blue-100">
              {isLogin
                ? "Acesse o sistema de gestão de processos imobiliários"
                : "Crie uma nova conta para começar"}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Usuário
                </label>
                <Input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="seu_usuario"
                  disabled={isLoading}
                  required
                  className="border-slate-300"
                />
              </div>

              {/* Email (only for register) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu_email@exemplo.com"
                    disabled={isLoading}
                    required
                    className="border-slate-300"
                  />
                </div>
              )}

              {/* Name (only for register) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nome Completo
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Seu Nome"
                    disabled={isLoading}
                    required
                    className="border-slate-300"
                  />
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Senha
                </label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={isLoading}
                  required
                  className="border-slate-300"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {isLoading ? "Processando..." : isLogin ? "Entrar" : "Criar Conta"}
              </Button>
            </form>

            {/* Toggle between login and register */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                {isLogin ? "Não tem conta? " : "Já tem conta? "}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setFormData({ username: "", email: "", password: "", name: "" });
                  }}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  {isLogin ? "Criar uma" : "Fazer login"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-600">
          <p>© 2026 DM Engenharia e Consultoria. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}
