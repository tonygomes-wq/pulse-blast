import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface Campaign {
  id: string;
  name: string;
  status: string;
  total_contacts: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading campaigns:", error);
    } else {
      setCampaigns(data || []);
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      draft: { variant: "secondary", label: "Rascunho" },
      running: { variant: "default", label: "Em execução" },
      completed: { variant: "default", label: "Concluída" },
      failed: { variant: "destructive", label: "Falhou" },
    };

    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Campanhas</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie suas campanhas de disparo
            </p>
          </div>
          <Link to="/campaigns/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Campanha
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Suas Campanhas ({campaigns.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Nenhuma campanha criada ainda.
                </p>
                <Link to="/campaigns/new">
                  <Button>
                    <Send className="mr-2 h-4 w-4" />
                    Criar Primeira Campanha
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <Link key={campaign.id} to={`/campaigns/${campaign.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-lg">{campaign.name}</h3>
                              {getStatusBadge(campaign.status)}
                            </div>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <span>Total: {campaign.total_contacts}</span>
                              <span className="text-success">Enviados: {campaign.sent_count}</span>
                              {campaign.failed_count > 0 && (
                                <span className="text-destructive">Falhas: {campaign.failed_count}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(campaign.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
