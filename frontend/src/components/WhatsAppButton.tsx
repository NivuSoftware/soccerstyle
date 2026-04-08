import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { getWhatsAppLink } from "@/data/products";

const WhatsAppButton = () => {
  return (
    <motion.a
      href={getWhatsAppLink()}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1, type: "spring" }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-neon flex items-center justify-center box-glow hover:box-glow-strong transition-shadow"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle size={26} className="text-primary-foreground" />
    </motion.a>
  );
};

export default WhatsAppButton;
