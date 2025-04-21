import { ReactNode } from "react";
import { motion } from "framer-motion";

interface CrtEffectProps {
  children: ReactNode;
}

export function CrtEffect({ children }: CrtEffectProps) {
  return (
    <motion.div 
      className="crt bg-arcade-dark border-4 border-gray-700 rounded-lg p-4 sm:p-6 md:p-10 relative max-w-6xl mx-auto shadow-2xl"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="scanline"></div>
      {children}
    </motion.div>
  );
}
