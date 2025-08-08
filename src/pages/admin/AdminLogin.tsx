import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Loader2, Lock, Mail } from "lucide-react";

export default function AdminLogin() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Basic SEO
  if (typeof document !== "undefined") {
    document.title = "Admin Login | Super Admin";
    const canonical = document.querySelector('link[rel="canonical"]') || document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    canonical.setAttribute("href", `${window.location.origin}/admin`);
    if (!canonical.parentElement) document.head.appendChild(canonical);

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", "Admin login for super admin access and dashboard management.");
  }

  // If already logged in and has role, redirect
  useEffect(() => {
    const sub = supabase.auth.onAuthStateChange((_event, session) => {
      // Avoid supabase calls in callback; defer check
      if (session?.user) {
        setTimeout(async () => {
          const { data: has, error } = await supabase.rpc("has_role", {
            _user_id: session.user!.id,
            _role: "super_admin",
          });
          if (!error && has) navigate("/admin/dashboard", { replace: true });
        }, 0);
      }
    }).data.subscription;

    // Initial check
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user;
      if (user) {
        const { data: has, error } = await supabase.rpc("has_role", {
          _user_id: user.id,
          _role: "super_admin",
        });
        if (!error && has) navigate("/admin/dashboard", { replace: true });
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const user = data.user;
      if (!user) throw new Error("Login failed");

      const { data: has, error: roleErr } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "super_admin",
      });

      if (roleErr) throw roleErr;

      if (has) {
        toast({ title: "Welcome, Super Admin", description: "Redirecting to dashboard..." });
        navigate("/admin/dashboard", { replace: true });
      } else {
        await supabase.auth.signOut();
        toast({
          title: "Access denied",
          description: "This account is not a super admin.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container py-16">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> Admin Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4" aria-label="Super Admin Login">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button type="submit" className="w-full btn-gradient" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing in...</> : "Sign in"}
            </Button>

            <p className="text-xs text-muted-foreground">
              Only super_admin users can access the Admin Dashboard.
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
