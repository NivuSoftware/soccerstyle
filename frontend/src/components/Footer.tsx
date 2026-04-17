import { Link } from "react-router-dom";
import { MapPin, Clock, ExternalLink } from "lucide-react";
import { getWhatsAppLink } from "@/data/products";
import { getPublicCategoryPath } from "@/data/seo";

const quickLinks = [
  { href: getPublicCategoryPath("pupillos"), label: "Pupillos de fútbol" },
  { href: getPublicCategoryPath("futsal"), label: "Zapatos futsal" },
  { href: getPublicCategoryPath("accesorios"), label: "Accesorios de fútbol" },
  { href: "/contacto", label: "Contacto" },
];

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid gap-10 mb-12 md:grid-cols-2 xl:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-display font-bold mb-4">
              SOCCER <span className="text-primary">STYLE</span>
              <span className="text-primary text-xs align-super">®</span>
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Primera y única cadena en Ecuador dedicada 100% al fútbol.
            </p>
            <div className="flex gap-4">
              <a href="https://www.tiktok.com/@soccerstyleec" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors text-sm">TikTok</a>
              <a href="https://www.instagram.com/soccerstyleecu" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors text-sm">Instagram</a>
              <a href="https://www.facebook.com/SoccerStyleEc" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors text-sm">Facebook</a>
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-sm text-primary mb-4 tracking-wider uppercase">
              Enlaces
            </h4>
            <div className="grid gap-3 text-sm text-muted-foreground">
              {quickLinks.map((link) => (
                <Link key={link.href} to={link.href} className="transition hover:text-primary">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Riobamba */}
          <div>
            <h4 className="font-display font-bold text-sm text-primary mb-4 tracking-wider uppercase">Riobamba</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 text-primary shrink-0" /> Pichincha y Villarroel</p>
              <p className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 text-primary shrink-0" /> Argentinos entre Colón y Espejo</p>
              <p className="font-medium text-foreground">Horario de atención</p>
              <p className="flex items-start gap-2"><Clock size={14} className="mt-0.5 text-primary shrink-0" /> 10am a 1:30pm - 3pm a 7pm</p>
            </div>
          </div>

          {/* Latacunga */}
          <div>
            <h4 className="font-display font-bold text-sm text-primary mb-4 tracking-wider uppercase">Latacunga</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 text-primary shrink-0" /> Belisario Quevedo y Padre Salcedo</p>
              <p className="font-medium text-foreground">Horario de atención</p>
              <p className="flex items-start gap-2"><Clock size={14} className="mt-0.5 text-primary shrink-0" /> 9:30am a 7pm</p>
            </div>
          </div>
        </div>

        <div className="line-glow mb-6" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2024 Soccer Style®. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              Contáctanos por WhatsApp <ExternalLink size={12} />
            </a>
            <span className="text-border">|</span>
            <a
              href="https://nivusoftware.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <img src="/images/logo_nube.png" alt="NivuSoftware" className="w-4 h-4 object-contain" />
              Desarrollado por NivuSoftware
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
