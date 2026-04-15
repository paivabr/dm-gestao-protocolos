import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, ArrowLeft } from "lucide-react";

export default function RecuperarSenha() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // TODO: Implementar chamada à API de recuperação de senha
      // await trpc.auth.requestPasswordReset.mutate({ email });
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Erro ao enviar email de recuperação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <Lock className="h-6 w-6 text-blue-600" />
            <CardTitle>Recuperar Senha</CardTitle>
          </div>
          <CardDescription>
            Digite seu email para receber um link de recuperação de senha
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  required
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Enviando..." : "Enviar Link de Recuperação"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate("/login")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Login
              </Button>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700 font-medium">Email enviado com sucesso!</p>
                <p className="text-green-600 text-sm mt-2">
                  Verifique seu email para o link de recuperação de senha.
                </p>
              </div>

              <p className="text-sm text-gray-600">
                O link expira em 1 hora. Se não receber o email, verifique sua pasta de spam.
              </p>

              <Button
                type="button"
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate("/login")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
