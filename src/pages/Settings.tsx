import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Save } from "lucide-react";

const SETTINGS_KEY = "evolution-api-settings";

const defaultSettings = {
  url: "https://whatsmacip.macip.com.br",
  apiKey: "4DAEB69B7F7A-47B2-AD0D-E29E3262AE1D",
  instance: "CELULAR MACIP",
};

export default function Settings() {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    } else {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    toast.success("Configurações salvas com sucesso!");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSettings((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground mt-2">
            Configure suas credenciais da Evolution API
          </p>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Credenciais da API</CardTitle>
            <CardDescription>
              Essas informações são salvas localmente no seu navegador.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">URL da Evolution API</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://whatsmacip.macip.com.br"
                  value={settings.url}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKey">Chave da API (apiKey)</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Sua chave de API secreta"
                  value={settings.apiKey}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instance">Nome da Instância</Label>
                <Input
                  id="instance"
                  placeholder="Nome da sua instância"
                  value={settings.instance}
                  onChange={handleChange}
                  required
                />
              </div>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Salvar Configurações
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}