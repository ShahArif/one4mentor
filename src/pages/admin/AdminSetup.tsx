import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, UserPlus, Loader2 } from "lucide-react";

export default function AdminSetup() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // SEO basics
  if (typeof document !== "undefined") {
    document.title = "Admin Setup | Seed Super Admin";
    const link = document.querySelector('link[rel="canonical"]') || document.createElement("link");
    link.setAttribute("rel", "canonical");
    link.setAttribute("href", `${window.location.origin}/admin/setup`);
    if (!link.parentElement) document.head.appendChild(link);
  }

  const seed = async () => {
    try {
      setLoading(true);
      setResult(null);
      const { data, error } = await supabase.functions.invoke("seed-super-admin", {
        method: "POST",
      });
      if (error) throw error;
      setResult(JSON.stringify(data, null, 2));
      toast({ title: "Super admin ready", description: `Email: ${data.email}` });
    } catch (e: any) {
      toast({ title: "Failed to seed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container py-16">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5"/> Admin Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Click the button to create the Super Admin account (a@b.com) and assign the super_admin role.
          </p>
          <Button onClick={seed} disabled={loading} className="btn-gradient">
            {loading ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin"/> Seeding...</>) : (<><UserPlus className="h-4 w-4 mr-2"/> Seed Super Admin</>)}
          </Button>
          {result && (
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words">{result}</pre>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
