import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Tags, Send, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [stats, setStats] = useState({
    contacts: 0,
    categories: 0,
    campaigns: 0,
    sentMessages: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [contactsRes, categoriesRes, campaignsRes, messagesRes] = await Promise.all([
      supabase.from("contacts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("categories").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("campaigns").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("campaign_messages").select("id", { count: "exact", head: true }).eq("status", "sent"),
    ]);

    setStats({
      contacts: contactsRes.count || 0,
      categories: categoriesRes.count || 0,
      campaigns: campaignsRes.count || 0,
      sentMessages: messagesRes.count || 0,
    });
  };

  const statCards = [
    {
      title: "Total de Contatos",
      value: stats.contacts,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      link: "/contacts",
    },
    {
      title: "Categorias",
      value: stats.categories,
      icon: Tags,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      link: "/categories",
    },
    {
      title: "Campanhas",
      value: stats.campaigns,
      icon: Send,
      color: "text-primary",
      bgColor: "bg-whatsapp-light",
      link: "/campaigns",
    },
    {
      title: "Mensagens Enviadas",
      value: stats.sentMessages,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Bem-vindo ao seu sistema de disparo em massa de WhatsApp
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  {stat.link && (
                    <Link to={stat.link}>
                      <Button variant="link" className="px-0 mt-2">
                        Ver detalhes →
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Começar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Para começar a usar o sistema de disparos, siga estes passos:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Cadastre seus contatos ou importe via CSV</li>
              <li>Organize seus contatos em categorias</li>
              <li>Crie uma campanha e selecione os destinatários</li>
              <li>Escreva sua mensagem com macros personalizadas</li>
              <li>Inicie o disparo e acompanhe o progresso em tempo real</li>
            </ol>
            <div className="flex gap-4 mt-6">
              <Link to="/contacts">
                <Button>
                  <Users className="mr-2 h-4 w-4" />
                  Gerenciar Contatos
                </Button>
              </Link>
              <Link to="/campaigns">
                <Button variant="outline">
                  <Send className="mr-2 h-4 w-4" />
                  Nova Campanha
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
