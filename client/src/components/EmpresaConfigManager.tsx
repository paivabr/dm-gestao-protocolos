import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Building2, Save, Globe, Mail, Phone, MapPin, CreditCard, Palette } from "lucide-react";

export default function EmpresaConfigManager() {
  const { data: config, isLoading, refetch } = trpc.empresa.getConfig.useQuery();
  const updateMutation = trpc.empresa.updateConfig.useMutation({
    onSuccess: () => {
      toast.success("Configurações da empresa atualizadas!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar configurações");
    }
  });

  const [formData, setFormData] = useState({
    nomeFantasia: "",
    razaoSocial: "",
    cnpj: "",
    email: "",
    telefone: "",
    endereco: "",
    website: "",
    logoUrl: "",
    corPrimaria: "#3b82f6",
  });

  useEffect(() => {
    if (config) {
      setFormData({
        nomeFantasia: config.nomeFantasia || "",
        razaoSocial: config.razaoSocial || "",
        cnpj: config.cnpj || "",
        email: config.email || "",
        telefone: config.telefone || "",
        endereco: config.endereco || "",
        website: config.website || "",
        logoUrl: config.logoUrl || "",
        corPrimaria: config.corPrimaria || "#3b82f6",
      });
    }
  }, [config]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextareaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) return <div className="p-4 text-center">Carregando configurações...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Dados da Empresa
            </CardTitle>
            <CardDescription>Informações básicas que aparecerão no sistema e relatórios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome Fantasia *</label>
              <Input name="nomeFantasia" value={formData.nomeFantasia} onChange={handleChange} placeholder="Ex: DM Engenharia" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Razão Social</label>
              <Input name="razaoSocial" value={formData.razaoSocial} onChange={handleChange} placeholder="Ex: DM Engenharia e Consultoria LTDA" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">CNPJ</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input name="cnpj" value={formData.cnpj} onChange={handleChange} className="pl-10" placeholder="00.000.000/0000-00" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              Contato e Localização
            </CardTitle>
            <CardDescription>Meios de contato e endereço físico</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">E-mail de Contato</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input name="email" type="email" value={formData.email} onChange={handleChange} className="pl-10" placeholder="contato@empresa.com" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Telefone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input name="telefone" value={formData.telefone} onChange={handleChange} className="pl-10" placeholder="(00) 00000-0000" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Endereço Completo</label>
              <Textarea name="endereco" value={formData.endereco} onChange={handleChange} placeholder="Rua, Número, Bairro, Cidade - UF" rows={2} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-purple-600" />
              Identidade Visual
            </CardTitle>
            <CardDescription>Personalize a aparência do seu sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">URL da Logo (PNG ou JPG)</label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input name="logoUrl" value={formData.logoUrl} onChange={handleChange} className="pl-10" placeholder="https://link-da-sua-logo.png" />
              </div>
              <p className="text-xs text-gray-500">A logo será exibida no topo do menu e nos relatórios PDF.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cor Primária do Sistema</label>
              <div className="flex gap-3">
                <Input name="corPrimaria" type="color" value={formData.corPrimaria} onChange={handleChange} className="w-12 h-10 p-1" />
                <Input value={formData.corPrimaria} onChange={handleChange} name="corPrimaria" className="flex-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-center items-center p-6 bg-slate-50 border-dashed border-2">
          <div className="text-center space-y-4">
            <h3 className="font-semibold text-slate-700">Salvar Alterações</h3>
            <p className="text-sm text-slate-500 max-w-xs">As alterações serão aplicadas imediatamente em todo o sistema e nos novos relatórios gerados.</p>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={updateMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </Card>
      </div>
    </form>
  );
}
