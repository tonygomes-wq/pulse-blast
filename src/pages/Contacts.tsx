import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Download, Upload, Edit2 } from "lucide-react";
import Papa from "papaparse";

interface Contact {
  id: string;
  name: string | null;
  whatsapp: string;
  created_at: string;
  categories?: { id: string; name: string; color: string }[];
}

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({ name: "", whatsapp: "" });

  useEffect(() => {
    loadContacts();
    loadCategories();
  }, []);

  const loadContacts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("contacts")
      .select(`
        *,
        contact_categories(
          category:categories(id, name, color)
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar contatos");
    } else {
      const formattedContacts = data?.map(contact => ({
        ...contact,
        categories: contact.contact_categories?.map((cc: any) => cc.category).filter(Boolean) || []
      })) || [];
      setContacts(formattedContacts);
    }
    setLoading(false);
  };

  const loadCategories = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id);

    if (data) setCategories(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editingContact) {
      const { error } = await supabase
        .from("contacts")
        .update({ name: formData.name || null, whatsapp: formData.whatsapp })
        .eq("id", editingContact.id);

      if (error) {
        toast.error("Erro ao atualizar contato");
      } else {
        toast.success("Contato atualizado!");
        loadContacts();
        setDialogOpen(false);
        setEditingContact(null);
        setFormData({ name: "", whatsapp: "" });
      }
    } else {
      const { error } = await supabase
        .from("contacts")
        .insert({ name: formData.name || null, whatsapp: formData.whatsapp, user_id: user.id });

      if (error) {
        toast.error("Erro ao criar contato");
      } else {
        toast.success("Contato criado!");
        loadContacts();
        setDialogOpen(false);
        setFormData({ name: "", whatsapp: "" });
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este contato?")) return;

    const { error } = await supabase.from("contacts").delete().eq("id", id);

    if (error) {
      toast.error("Erro ao excluir contato");
    } else {
      toast.success("Contato excluído!");
      loadContacts();
    }
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const contactsToImport = results.data
          .filter((row: any) => row.whatsapp || row.telefone || row.phone)
          .map((row: any) => ({
            name: row.nome || row.name || null,
            whatsapp: row.whatsapp || row.telefone || row.phone,
            user_id: user.id,
          }));

        if (contactsToImport.length === 0) {
          toast.error("Nenhum contato válido encontrado no arquivo");
          return;
        }

        const { error } = await supabase.from("contacts").insert(contactsToImport);

        if (error) {
          toast.error("Erro ao importar contatos");
        } else {
          toast.success(`${contactsToImport.length} contatos importados!`);
          loadContacts();
        }
      },
    });
  };

  const downloadTemplate = () => {
    const csv = "nome,whatsapp\nJoão Silva,5511999999999\nMaria Santos,5511888888888";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template-contatos.csv";
    a.click();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Contatos</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie seus contatos de WhatsApp
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Template CSV
            </Button>
            <Button variant="outline" asChild>
              <label htmlFor="csv-upload" className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Importar CSV
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleImportCSV}
                />
              </label>
            </Button>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                setEditingContact(null);
                setFormData({ name: "", whatsapp: "" });
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Contato
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingContact ? "Editar Contato" : "Novo Contato"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome (opcional)</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nome do contato"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp *</Label>
                    <Input
                      id="whatsapp"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="5511999999999"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {editingContact ? "Atualizar" : "Criar"} Contato
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Contatos ({contacts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum contato cadastrado. Comece adicionando um contato ou importando via CSV.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Categorias</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell>{contact.name || "-"}</TableCell>
                      <TableCell className="font-mono">{contact.whatsapp}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {contact.categories?.map((cat) => (
                            <Badge
                              key={cat.id}
                              style={{ backgroundColor: cat.color }}
                              className="text-white"
                            >
                              {cat.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingContact(contact);
                            setFormData({ name: contact.name || "", whatsapp: contact.whatsapp });
                            setDialogOpen(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(contact.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
