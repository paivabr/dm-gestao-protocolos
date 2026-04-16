import { useState } from "react";
import { Trash2, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import type { Processo } from "@/types";

interface ChecklistModalProps {
  processoId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  processo?: Processo;
}

export default function ChecklistModal({
  processoId,
  open,
  onOpenChange,
  processo,
}: ChecklistModalProps) {
  const [newItem, setNewItem] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  const { data: itens, isLoading, refetch } = trpc.checklist.getByProcesso.useQuery({
    processoId,
  });

  const addItemMutation = trpc.checklist.addItem.useMutation();
  const toggleItemMutation = trpc.checklist.toggleItem.useMutation();
  const deleteItemMutation = trpc.checklist.deleteItem.useMutation();

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    try {
      await addItemMutation.mutateAsync({
        processoId,
        item: newItem,
      });
      toast.success("Item adicionado ao checklist!");
      setNewItem("");
      refetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao adicionar item";
      toast.error(message);
    }
  };

  const handleToggleItem = async (id: number, concluido: number) => {
    try {
      await toggleItemMutation.mutateAsync({
        id,
        concluido: concluido === 1 ? 0 : 1,
      });
      refetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar item";
      toast.error(message);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este item?")) {
      try {
        await deleteItemMutation.mutateAsync({ id });
        toast.success("Item deletado!");
        refetch();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao deletar item";
        toast.error(message);
      }
    }
  };

  const filteredItens = itens?.filter(item =>
    item.item.toLowerCase().includes(filterSearch.toLowerCase())
  );

  const completedCount = itens?.filter(i => i.concluido === 1).length || 0;
  const totalCount = itens?.length || 0;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Checklist de Documentos</DialogTitle>
          <DialogDescription>
            {processo?.titulo} - {processo?.cliente?.nome}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Progresso</span>
              <span className="font-semibold text-slate-900">
                {completedCount} de {totalCount} itens
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Add Item Form */}
          <form onSubmit={handleAddItem} className="flex gap-2">
            <Input
              type="text"
              placeholder="Adicionar novo documento/tarefa..."
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
            </Button>
          </form>

          {/* Search Filter */}
          <Input
            type="text"
            placeholder="Buscar itens..."
            value={filterSearch}
            onChange={e => setFilterSearch(e.target.value)}
            className="w-full"
          />

          {/* Items List */}
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center py-8 text-slate-600">Carregando...</div>
            ) : filteredItens && filteredItens.length > 0 ? (
              filteredItens.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <button
                    onClick={() => handleToggleItem(item.id, item.concluido)}
                    className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                      item.concluido === 1
                        ? "bg-green-600 border-green-600"
                        : "border-slate-300 hover:border-green-600"
                    }`}
                  >
                    {item.concluido === 1 && <Check className="h-4 w-4 text-white" />}
                  </button>
                  <span
                    className={`flex-1 ${
                      item.concluido === 1
                        ? "line-through text-slate-500"
                        : "text-slate-900"
                    }`}
                  >
                    {item.item}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-600">
                Nenhum item no checklist. Adicione um novo item para começar.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
