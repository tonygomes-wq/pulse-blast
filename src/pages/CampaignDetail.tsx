import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ArrowLeft, Play, CheckCircle2, XCircle, Clock } from "lucide-react";
import Confetti from "react-confetti";

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [running, setRunning] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    loadCampaign();
    loadMessages();

    const channel = supabase
      .channel('campaign-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campaign_messages', filter: `campaign_id=eq.${id}` }, loadMessages)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campaigns', filter: `id=eq.${id}` }, loadCampaign)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  const loadCampaign = async () => {
    const { data } = await supabase.from("campaigns").select("*").eq("id", id).single();
    if (data) setCampaign(data);
  };

  const loadMessages = async () => {
    const { data } = await supabase
      .from("campaign_messages")
      .select("*, contact:contacts(name, whatsapp)")
      .eq("campaign_id", id)
      .order("created_at");
    if (data) setMessages(data);
  };

  const startCampaign = async () => {
    setRunning(true);
    await supabase.from("campaigns").update({ status: "running", started_at: new Date().toISOString() }).eq("id", id);

    const pendingMessages = messages.filter(m => m.status === "pending");
    
    for (let i = 0; i < pendingMessages.length; i++) {
      const msg = pendingMessages[i];
      const delay = Math.random() * 8000 + 2000;
      
      setCurrentProgress((delay / 10000) * 100);
      await supabase.from("campaign_messages").update({ status: "sending" }).eq("id", msg.id);
      
      await new Promise(resolve => {
        let elapsed = 0;
        const interval = setInterval(() => {
          elapsed += 100;
          setCurrentProgress((elapsed / delay) * 100);
          if (elapsed >= delay) {
            clearInterval(interval);
            resolve(null);
          }
        }, 100);
      });

      await supabase.from("campaign_messages").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", msg.id);
      await supabase.from("campaigns").update({ sent_count: i + 1 }).eq("id", id);
      setCurrentProgress(0);
    }

    await supabase.from("campaigns").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", id);
    setRunning(false);
    setShowConfetti(true);
    toast.success("🎉 Campanha concluída com sucesso!");
    setTimeout(() => setShowConfetti(false), 5000);
  };

  if (!campaign) return <Layout><div>Carregando...</div></Layout>;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent": return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "failed": return <XCircle className="h-5 w-5 text-destructive" />;
      case "sending": return <Clock className="h-5 w-5 text-warning animate-pulse" />;
      default: return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <Layout>
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/campaigns")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{campaign.name}</h1>
              <p className="text-muted-foreground mt-1">
                {campaign.sent_count} de {campaign.total_contacts} enviados
              </p>
            </div>
          </div>
          {campaign.status === "draft" && (
            <Button size="lg" onClick={startCampaign} disabled={running}>
              <Play className="mr-2 h-5 w-5" />
              {running ? "Enviando..." : "Iniciar Disparo"}
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Fila de Mensagens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {messages.map((msg) => (
                <div key={msg.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  {getStatusIcon(msg.status)}
                  <div className="flex-1">
                    <div className="font-medium">{msg.contact?.name || "Sem nome"}</div>
                    <div className="text-sm text-muted-foreground font-mono">{msg.contact?.whatsapp}</div>
                  </div>
                  {msg.status === "sending" && (
                    <div className="w-32">
                      <Progress value={currentProgress} className="h-2" />
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground capitalize">{msg.status === "sent" ? "Enviado" : msg.status === "sending" ? "Enviando" : "Aguardando"}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
