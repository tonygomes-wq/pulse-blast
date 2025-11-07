import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Palette } from "lucide-react";

interface Category {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

const PRESET_COLORS = [
  "#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444",
  "#ec4899", "#14b8a6", "#f97316", "#06b6d4", "#84cc16",
];

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", color: "#10b981" });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar categorias");
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("categories")
      .insert({ ...formData, user_id: user.id });

    if (error) {
      if (error.code === "23505") {
        toast.error("Já existe uma categoria com este nome");
      } else {
        toast.error("Erro ao criar categoria");
      }
    } else {
      toast.success("Categoria criada!");
      loadCategories();
      setDialogOpen(false);
      setFormData({ name: "", color: "#10b981" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;

    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      toast.error("Erro ao excluir categoria");
    } else {
      toast.success("Categoria excluída!");
      loadCategories();
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Categorias</h1>
            <p className="text-muted-foreground mt-2">
              Organize seus contatos em categorias
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Categoria</DialogTitle>
                <DialogDescription>
                  Crie uma nova categoria para organizar seus contatos.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome da categoria"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cor</Label>
                  <div className="flex gap-2 flex-wrap">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${
                          formData.color === color ? "border-foreground scale-110" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-20 h-10"
                    />
                    <span className="text-sm text-muted-foreground">{formData.color}</span>
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Criar Categoria
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Suas Categorias ({categories.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma categoria cadastrada. Comece criando sua primeira categoria.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                  <Card key={category.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="flex items-center justify-between p-4">
                      <Badge
                        style={{ backgroundColor: category.color }}
                        className="text-white text-lg px-4 py-2"
                      >
                        {category.name}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}