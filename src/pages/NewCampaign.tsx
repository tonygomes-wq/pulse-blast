import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Users, MessageCircle } from "lucide-react";

interface Contact {
  id: string;
  name: string | null;
  whatsapp: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

export default function NewCampaign() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [campaignName, setCampaignName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
    loadContacts();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadContactsByCategory(selectedCategory);
    } else {
      loadContacts();
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id);

    if (data) setCategories(data);
  };

  const loadContacts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("contacts")
      .select("*")
      .eq("user_id", user.id);

    if (data) setContacts(data);
  };

  const loadContactsByCategory = async (categoryId: string) => {
    const { data } = await supabase
      .from("contact_categories")
      .select("contact:contacts(*)")
      .eq("category_id", categoryId);

    if (data) {
      const contactsList = data.map((item: any) => item.contact).filter(Boolean);
      setContacts(contactsList);
    }
  };

  const toggleContact = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const selectAll = () => {
    if (selectedContacts.size === contacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(contacts.map(c => c.id)));
    }
  };

  const insertMacro = (macro: string) => {
    setMessage(prev => prev + macro);
  };

  const handleCreateCampaign = async () => {
    if (!campaignName || !message || selectedContacts.size === 0) {
      toast.error("Preencha todos os campos e selecione ao menos um contato");
      return;
    }

    setLoading(true);

    const selectedContactsList = contacts.filter(c => selectedContacts.has(c.id));
    const contactsForRPC = selectedContactsList.map(contact => {
      const personalizedMessage = message.replace(/\{\{nome\}\}/g, contact.name || "");
      return {
        contact_id: contact.id,
        message_content: personalizedMessage,
      };
    });

    const { data: newCampaignId, error } = await supabase.rpc('create_campaign_with_messages', {
      campaign_name: campaignName,
      contacts: contactsForRPC,
      message_template: message
    });

    setLoading(false);

    if (error) {
      console.error("Erro ao criar campanha:", error);
      toast.error("Erro ao criar campanha. Verifique o console para mais detalhes.");
      return;
    }

    toast.success("Campanha criada com sucesso!");
    navigate(`/campaigns/${newCampaignId}`);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/campaigns")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Nova Campanha</h1>
            <p className="text-muted-foreground mt-2">
              Crie uma nova campanha de disparo
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Campanha</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Campanha</Label>
                  <Input
                    id="name"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Ex: Promoção de Verão"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Selecionar Destinatários
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Filtrar por Categoria</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedCategory === null ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(null)}
                    >
                      Todos
                    </Button>
                    {categories.map((cat) => (
                      <Button
                        key={cat.id}
                        variant={selectedCategory === cat.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(cat.id)}
                        style={
                          selectedCategory === cat.id
                            ? { backgroundColor: cat.color, color: "white" }
                            : {}
                        }
                      >
                        {cat.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Contatos ({selectedContacts.size} selecionados)</Label>
                    <Button variant="ghost" size="sm" onClick={selectAll}>
                      {selectedContacts.size === contacts.length ? "Desmarcar todos" : "Selecionar todos"}
                    </Button>
                  </div>
                  <div className="border rounded-lg max-h-[400px] overflow-y-auto">
                    {contacts.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        Nenhum contato encontrado
                      </div>
                    ) : (
                      <div className="divide-y">
                        {contacts.map((contact) => (
                          <div
                            key={contact.id}
                            className="flex items-center space-x-3 p-3 hover:bg-accent cursor-pointer"
                            onClick={() => toggleContact(contact.id)}
                          >
                            <Checkbox
                              checked={selectedContacts.has(contact.id)}
                              onCheckedChange={() => toggleContact(contact.id)}
                            />
                            <div className="flex-1">
                              <div className="font-medium">
                                {contact.name || "Sem nome"}
                              </div>
                              <div className="text-sm text-muted-foreground font-mono">
                                {contact.whatsapp}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Mensagem
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Macros Disponíveis</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertMacro("{{nome}}")}
                    >
                      Inserir Nome
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Digite sua mensagem</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Olá {{nome}}, tudo bem? Venho lhe apresentar..."
                    className="min-h-[300px] font-sans"
                  />
                  <p className="text-sm text-muted-foreground">
                    Use {"{{nome}}"} para inserir o nome do destinatário
                  </p>
                </div>

                <div className="border rounded-lg p-4 bg-whatsapp-light">
                  <div className="text-sm font-medium mb-2">Pré-visualização:</div>
                  <div className="whitespace-pre-wrap bg-background p-3 rounded-lg shadow-sm">
                    {message.replace(/\{\{nome\}\}/g, "João Silva") || "Sua mensagem aparecerá aqui..."}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full"
              size="lg"
              onClick={handleCreateCampaign}
              disabled={loading || selectedContacts.size === 0}
            >
              {loading ? "Criando..." : `Criar Campanha (${selectedContacts.size} contatos)`}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}