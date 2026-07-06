import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const resetMutation = trpc.auth.resetPassword.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Token de recuperação inválido ou ausente.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      await resetMutation.mutateAsync({
        token,
        newPassword: password,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Erro ao redefinir senha. O link pode ter expirado.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-red-600">Erro</CardTitle>
            <CardDescription>Token de recuperação inválido.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate("/login")}>
              Voltar ao Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <Lock className="h-6 w-6 text-blue-600" />
            <CardTitle>Redefinir Senha</CardTitle>
          </div>
          <CardDescription>
            Digite sua nova senha abaixo
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nova Senha
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Nova Senha
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  required
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Redefinindo..." : "Redefinir Senha"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col items-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-2" />
                <p className="text-green-700 font-medium">Senha redefinida com sucesso!</p>
                <p className="text-green-600 text-sm mt-2">
                  Você já pode fazer login com sua nova senha.
                </p>
              </div>

              <Button
                type="button"
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate("/login")}
              >
                Ir para o Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
