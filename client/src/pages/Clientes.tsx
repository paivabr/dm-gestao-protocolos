import { useState } from "react";
import type { Cliente } from "@shared/types";
import { Trash2, Plus, AlertCircle, Edit } from "lucide-react";
import { isValidCPFOrCNPJ } from "@shared/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Clientes() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    cpfCnpj: "",
    contato: "",
  });

  const { data: clientes, isLoading, refetch } = trpc.clientes.list.useQuery();
  const createMutation = trpc.clientes.create.useMutation();
  const updateMutation = trpc.clientes.update.useMutation();
  const deleteMutation = trpc.clientes.delete.useMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidCPFOrCNPJ(formData.cpfCnpj)) {
      toast.error("CPF ou CNPJ inválido");
      return;
    }
    
    try {
      if (editingId) {
        // Editar cliente existente
        await updateMutation.mutateAsync({
          id: editingId,
          nome: formData.nome || undefined,
          cpfCnpj: formData.cpfCnpj || undefined,
          contato: formData.contato || undefined,
        });
        toast.success("Cliente atualizado com sucesso!");
      } else {
        // Criar novo cliente
        await createMutation.mutateAsync({
          nome: formData.nome,
          cpfCnpj: formData.cpfCnpj,
          contato: formData.contato,
        });
        toast.success("Cliente cadastrado com sucesso!");
      }
      setFormData({ nome: "", cpfCnpj: "", contato: "" });
      setEditingId(null);
      setOpen(false);
      refetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao salvar cliente";
      toast.error(message);
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setFormData({
      nome: cliente.nome,
      cpfCnpj: cliente.cpfCnpj,
      contato: cliente.contato || "",
    });
    setEditingId(cliente.id);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingId(null);
    setFormData({ nome: "", cpfCnpj: "", contato: "" });
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este cliente?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("Cliente deletado com sucesso!");
        refetch();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao deletar cliente";
        toast.error(message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestão de Clientes</h1>
          <p className="text-slate-600 mt-2">Cadastre e gerencie informações de clientes</p>
        </div>
        <Dialog open={open} onOpenChange={handleCloseDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Cliente" : "Cadastrar Novo Cliente"}</DialogTitle>
              <DialogDescription>
                {editingId ? "Atualize os dados do cliente" : "Preencha os dados do cliente para cadastrá-lo no sistema"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nome Completo / Razão Social
                </label>
                <Input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Ex: João Silva"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  CPF / CNPJ
                </label>
                <Input
                  type="text"
                  name="cpfCnpj"
                  value={formData.cpfCnpj}
                  onChange={handleChange}
                  placeholder="Ex: 123.456.789-00"
                  required
                />
                {formData.cpfCnpj && !isValidCPFOrCNPJ(formData.cpfCnpj) && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    CPF ou CNPJ inválido
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Contato (Telefone/Email)
                </label>
                <Input
                  type="text"
                  name="contato"
                  value={formData.contato}
                  onChange={handleChange}
                  placeholder="Ex: (11) 99999-9999 ou email@exemplo.com"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? "Salvando..." : (editingId ? "Atualizar Cliente" : "Cadastrar Cliente")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Clientes Cadastrados</CardTitle>
          <CardDescription>
            Total de {clientes?.length || 0} cliente(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-slate-600">Carregando...</div>
          ) : clientes && clientes.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF/CNPJ</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientes.map(cliente => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">{cliente.nome}</TableCell>
                      <TableCell>{cliente.cpfCnpj}</TableCell>
                      <TableCell>{cliente.contato || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(cliente)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(cliente.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-600">
              Nenhum cliente cadastrado. Clique em "Novo Cliente" para começar.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
