import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, LoaderCircle } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { ADMIN_DASHBOARD_PATH } from "@/lib/admin-routes";
import { ApiError } from "@/services/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LoginLocationState {
  from?: string;
}

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const locationState = location.state as LoginLocationState | null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await login({
        email: email.trim(),
        password,
      });

      navigate(locationState?.from || ADMIN_DASHBOARD_PATH, { replace: true });
    } catch (unknownError) {
      if (unknownError instanceof ApiError) {
        setError(unknownError.message);
      } else if (unknownError instanceof Error) {
        setError(unknownError.message);
      } else {
        setError("No pudimos iniciar sesion. Intenta nuevamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_28%),linear-gradient(180deg,_#06110c_0%,_#040806_100%)] text-foreground">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20" />
      <div className="absolute -top-24 right-[-80px] h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute bottom-[-120px] left-[-60px] h-72 w-72 rounded-full bg-primary/15 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden flex-col justify-center rounded-[2rem] border border-primary/15 bg-card/50 p-8 backdrop-blur-xl lg:flex lg:p-12"
          >
            <div className="mb-8 inline-flex w-fit items-center gap-3 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              <ShieldCheck className="h-4 w-4" />
              Acceso interno
            </div>

            <Link to="/" className="mb-8 flex items-center gap-4">
              <img
                src="/images/logo.png"
                alt="Soccer Style"
                className="h-14 w-14 object-contain"
              />
              <div>
                <p className="font-display text-3xl font-black tracking-tight">
                  SOCCER <span className="text-primary">STYLE</span>
                </p>
                <p className="text-sm uppercase tracking-[0.32em] text-muted-foreground">
                  Backoffice oficial
                </p>
              </div>
            </Link>

            <h1 className="max-w-xl font-display text-4xl font-black leading-none sm:text-5xl">
              Controla el catálogo con una experiencia alineada a la cancha.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Inicia sesión para administrar productos, tallas, precios e imágenes desde un panel privado con identidad Soccer Style.
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="mx-auto w-full max-w-xl rounded-[2rem] border border-primary/20 bg-card/90 p-8 shadow-[0_0_50px_rgba(34,197,94,0.12)] backdrop-blur-xl lg:max-w-none lg:p-10"
          >
            <div className="mb-8">
              <p className="text-sm uppercase tracking-[0.3em] text-primary">Login</p>
              <h2 className="mt-3 font-display text-3xl font-bold">Administrador</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Esta ruta no se publica en la navegación del sitio. Solo el equipo autorizado puede entrar aquí.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <Alert variant="destructive" className="border-destructive/40 bg-destructive/10">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="admin-email">Correo electrónico</Label>
                <Input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@soccerstyle.com"
                  className="h-12 rounded-xl border-border/70 bg-background/70"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password">Contraseña</Label>
                <Input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="h-12 rounded-xl border-border/70 bg-background/70"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full rounded-xl gradient-neon text-base font-semibold text-primary-foreground shadow-[0_0_32px_rgba(34,197,94,0.2)]"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Ingresando...
                  </>
                ) : (
                  "Entrar al panel"
                )}
              </Button>
            </form>
          </motion.section>
        </div>
      </div>
    </main>
  );
};

export default AdminLogin;
