import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Plane } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      await login(email.trim(), password);
      toast.success("Connexion réussie");
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Connexion impossible");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-muted/40 via-background to-background">
      <Navbar variant="solid" />
      <main
        className={cn(
          "flex w-full flex-1 flex-col overflow-y-auto",
          "justify-start px-5 pb-8 pt-28 sm:px-6 sm:pb-10 sm:pt-32"
        )}
      >
        <div className="mx-auto w-full max-w-md space-y-8 pb-4">
          <div className="space-y-3 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <Plane className="h-6 w-6" aria-hidden />
            </div>
            <h1 className="font-serif text-3xl tracking-tight text-foreground md:text-4xl">Connexion</h1>
            <p className="mx-auto max-w-2xl text-center text-sm leading-relaxed text-muted-foreground md:text-base">
              {
                "Accédez à vos notifications et à l’historique de recherche lié à votre compte."
              }
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-border/80 bg-card/80 p-6 shadow-md shadow-foreground/[0.04] ring-1 ring-border/50 backdrop-blur-sm md:p-8"
          >
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-pressed={showPassword}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                </button>
              </div>
            </div>
            <Button type="submit" className="h-11 w-full text-base font-medium shadow-sm" disabled={pending}>
              {pending ? "Connexion…" : "Se connecter"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Pas encore de compte ?{" "}
              <Link to="/register" className="font-medium text-accent underline-offset-4 hover:underline">
                S’inscrire
              </Link>
            </p>
          </form>
        </div>
      </main>
      <Footer variant="compact" />
    </div>
  );
};

export default Login;
