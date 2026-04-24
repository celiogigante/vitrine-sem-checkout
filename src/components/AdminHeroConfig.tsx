import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ImageUpload";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface HeroConfig {
  id: string;
  hero_name: string;
  hero_image_url: string | null;
  hero_logo_url: string | null;
  carousel_title: string;
}

export default function AdminHeroConfig() {
  const { toast } = useToast();
  const [config, setConfig] = useState<HeroConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    hero_name: "",
    hero_image_url: "",
    carousel_title: "",
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("hero_config")
        .select("*")
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setConfig(data as HeroConfig);
        setForm({
          hero_name: data.hero_name || "",
          hero_image_url: data.hero_image_url || data.hero_logo_url || "",
          carousel_title: data.carousel_title || "",
        });
      }
    } catch (err) {
      console.error("Error loading hero config:", err);
      toast({
        title: "Erro ao carregar configuração do hero",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.hero_name || !form.carousel_title) {
      toast({
        title: "Preencha nome do hero e título do carrossel",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      if (config) {
        const { error } = await supabase
          .from("hero_config")
          .update({
            hero_name: form.hero_name,
            hero_image_url: form.hero_image_url || null,
            carousel_title: form.carousel_title,
          })
          .eq("id", config.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("hero_config").insert([
          {
            hero_name: form.hero_name,
            hero_image_url: form.hero_image_url || null,
            carousel_title: form.carousel_title,
          },
        ]);

        if (error) throw error;
      }

      loadConfig();
      toast({ title: "Configuração salva com sucesso!" });
    } catch (err) {
      console.error("Error saving hero config:", err);
      toast({
        title: "Erro ao salvar configuração",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="rounded-xl border bg-card p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Configuração do Hero</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Configure o nome, logo e imagem do hero, além do título do carrossel de destaques.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Nome do Hero</label>
          <Input
            placeholder="Ex: Master Cell"
            value={form.hero_name}
            onChange={(e) => setForm({ ...form, hero_name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Título do Carrossel</label>
          <Input
            placeholder="Ex: Destaques"
            value={form.carousel_title}
            onChange={(e) => setForm({ ...form, carousel_title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Imagem do Hero (Logo/Foto)</label>
          <p className="text-xs text-muted-foreground mb-3">
            Imagem que aparecerá no lado esquerdo do hero. Pode ser logo ou foto.
          </p>
          <div className="space-y-2">
            {form.hero_image_url && (
              <div className="flex items-center gap-2">
                <img
                  src={form.hero_image_url}
                  alt="Hero"
                  className="h-32 w-auto rounded border"
                />
              </div>
            )}
            <ImageUpload
              onImagesUrls={(urls) =>
                setForm({ ...form, hero_image_url: urls[0] || "" })
              }
              currentImages={form.hero_image_url ? [form.hero_image_url] : []}
            />
          </div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={isSaving} className="w-full">
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Salvando...
          </>
        ) : (
          "Salvar Configurações"
        )}
      </Button>
    </div>
  );
}
