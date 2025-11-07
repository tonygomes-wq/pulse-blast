import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Users, MessageCircle, Send, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sanitizeWhatsappNumber } from "@/lib/utils";

interface Contact {
  id: string;
  name: string | null;
  whatsapp: string;
}

export default function QuickSend() {
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [manualNumber, setManualNumber] = useState("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = allContacts.filter(contact => {
      return (
        contact.name?.toLowerCase().includes(lowercasedFilter) ||
        contact.whatsapp.includes(lowercasedFilter)
      );
    });
    setFilteredContacts(filtered);
  }, [searchTerm, allContacts]);

  const loadContacts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("contacts")
      .select("id, name, whatsapp")
      .eq("user_id", user.id)
      .order("name");

    if (data) {
      setAllContacts(data);
      setFilteredContacts(data);
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

  const insertMacro = (macro: string) => {
    setMessage(prev => prev + macro);
  };

  const handleSendMessage = async () => {
    const recipients = allContacts.filter(c => selectedContacts.has(c.id));
    if (recipients.length === 0 && !manualNumber) {
      toast.error("Selecione ao menos um contato ou digite um número.");
      return;
    }
    if (!message) {
      toast.error("A mensagem não pode estar vazia.");
      return;
    }

    setLoading(true);

    const settingsStr = localStorage.getItem("evolution-api-settings");
    if (!settingsStr) {
      toast.error("Credenciais da API não configuradas. Vá para a página de Configurações.");
      setLoading(false);
      return;
    }
    const settings = JSON.parse(settingsStr);
    if (!settings.url || !settings.apiKey || !settings.instance) {
      toast.error("Configure a URL, Chave de API e Instância da API na página de Configurações.");
      setLoading(false);
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    const sendPromises = [];

    // Enviar para contatos selecionados
    for (const contact of recipients) {
      const personalizedMessage = message.replace(/\{\{nome\}\}/g, contact.name || "");
      sendPromises.push(
        supabase.functions.invoke('send-message', {
          body: {
            settings,
            number: sanitizeWhatsappNumber(contact.whatsapp),
            textMessage: { text: personalizedMessage },
          },
        }).then(({ error }) => {
          if (error) {
            errorCount++;
            toast.error(`Falha ao enviar para ${contact.name || contact.whatsapp}: ${error.message}`);
          } else {
            successCount++;
          }
        })
      );
    }

    // Enviar para número/grupo manual
    if (manualNumber.trim()) {
      const genericMessage = message.replace(/\{\{nome\}\}/g, "");
      sendPromises.push(
        supabase.functions.invoke('send-message', {
          body: {
            settings,
            number: sanitizeWhatsappNumber(manualNumber),
            textMessage: { text: genericMessage },
          },
        }).then(({ error }) => {
          if (error) {
            errorCount++;
            toast.error(`Falha ao enviar para ${manualNumber.trim()}: ${error.message}`);
          } else {
            successCount++;
          }
        })
      );
    }

    await Promise.all(sendPromises);

    setLoading(false);
    if (successCount > 0) {
      toast.success(`${successCount} mensagem(ns) enviada(s) com sucesso!`);
    }
    if (errorCount === 0 && successCount > 0) {
      setSelectedContacts(new Set());
      setManualNumber("");
      setMessage("");
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Envio Rápido</h1>
          <p className="text-muted-foreground mt-2">
            Envie uma mensagem avulsa para contatos ou grupos.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Destinatários
                </CardTitle>
                <CardDescription>
                  Selecione contatos da sua lista ou digite um número/ID de grupo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="manual-number">Número Avulso ou ID de Grupo</Label>
                  <Input
                    id="manual-number"
                    value={manualNumber}
                    onChange={(e) => setManualNumber(e.target.value)}
                    placeholder="Ex: 5511999999999 ou 12036304@g.us"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Selecionar Contatos ({selectedContacts.size} selecionados)</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar contato..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <ScrollArea className="h-72 w-full rounded-md border">
                    <div className="p-4">
                      {filteredContacts.length === 0 ? (
                        <div className="text-center text-sm text-muted-foreground">
                          Nenhum contato encontrado.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {filteredContacts.map((contact) => (
                            <div
                              key={contact.id}
                              className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent cursor-pointer"
                              onClick={() => toggleContact(contact.id)}
                            >
                              <Checkbox
                                checked={selectedContacts.has(contact.id)}
                                onCheckedChange={() => toggleContact(contact.id)}
                              />
                              <div className="flex-1">
                                <div className="font-medium">{contact.name || "Sem nome"}</div>
                                <div className="text-sm text-muted-foreground font-mono">{contact.whatsapp}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
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
                    placeholder="Olá {{nome}}, tudo bem?"
                    className="min-h-[300px] font-sans"
                  />
                  <p className="text-sm text-muted-foreground">
                    A macro {"{{nome}}"} só funciona para contatos selecionados da lista.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full"
              size="lg"
              onClick={handleSendMessage}
              disabled={loading}
            >
              {loading ? "Enviando..." : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Mensagem
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}