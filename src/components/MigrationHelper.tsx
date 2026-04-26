import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { migrateLocalStorageToSupabase, clearLocalStorageProducts } from "@/lib/migrateLocalStorageToSupabase";

export default function MigrationHelper() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<{ status: "idle" | "success" | "error"; message: string; count?: number }>({ status: "idle", message: "" });

  const handleMigrate = async () => {
    setIsRunning(true);
    setResult({ status: "idle", message: "" });

    try {
      const count = await migrateLocalStorageToSupabase();
      setResult({
        status: "success",
        message: `✅ Sucesso! ${count} produtos foram migrados para Supabase.`,
        count,
      });
    } catch (err) {
      setResult({
        status: "error",
        message: `❌ Erro na migração: ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleClearLocalStorage = () => {
    if (confirm("Tem certeza? Isso vai deletar os dados do localStorage depois que você confirmar a migração foi bem sucedida.")) {
      clearLocalStorageProducts();
      setResult({
        status: "success",
        message: "✅ Dados do localStorage foram limpos!",
      });
    }
  };

  return (
    <div className="space-y-4 p-6 bg-secondary/50 rounded-lg border border-yellow-500/20">
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Migração: localStorage → Supabase</h3>
        <p className="text-sm text-muted-foreground">
          Este processo irá copiar todos os produtos armazenados no navegador para o banco de dados Supabase. 
          Depois você pode limpar o localStorage para liberar espaço.
        </p>
      </div>

      <div className="space-y-3">
        <Button
          onClick={handleMigrate}
          disabled={isRunning || result.status === "success"}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Migrando...
            </>
          ) : result.status === "success" ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Migração Concluída
            </>
          ) : (
            "Iniciar Migração"
          )}
        </Button>

        {result.status === "success" && result.count ? (
          <>
            <Button
              onClick={handleClearLocalStorage}
              variant="outline"
              className="w-full"
            >
              Limpar localStorage
            </Button>

            <Alert className="border-emerald-500/50 bg-emerald-500/10">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-700 dark:text-emerald-400">
                {result.message}
              </AlertDescription>
            </Alert>
          </>
        ) : null}

        {result.status === "error" ? (
          <Alert className="border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              {result.message}
            </AlertDescription>
          </Alert>
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground">
        💡 Dica: Verifique o console do navegador (F12) para ver os logs detalhados da migração.
      </p>
    </div>
  );
}
