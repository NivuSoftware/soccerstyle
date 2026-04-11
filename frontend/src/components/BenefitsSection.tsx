import { motion } from "framer-motion";
import { Shield, Star, Layers } from "lucide-react";

const benefits = [
  { icon: Shield, title: "Producto Original", desc: "100% productos originales de las mejores marcas del mundo" },
  { icon: Star, title: "Servicio Premium", desc: "Asesoría especializada para encontrar tu calzado ideal" },
  { icon: Layers, title: "Gran Variedad", desc: "El catálogo más amplio de Ecuador en calzado y accesorios de fútbol" },
];

const BenefitsSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors duration-500 group"
            >
              <div className="w-12 h-12 rounded-lg gradient-neon flex items-center justify-center mx-auto mb-4 group-hover:box-glow transition-shadow duration-500">
                <b.icon size={24} className="text-primary-foreground" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2 text-foreground">{b.title}</h3>
              <p className="text-sm text-muted-foreground">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
