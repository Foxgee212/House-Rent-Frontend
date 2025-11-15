import React from "react";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";

export default function HeroAnimation() {
  return (
    <motion.div
      className="absolute w-28 h-28 rounded-full border-4 border-transparent"
      style={{
        background:
          "conic-gradient(from 0deg, #3b82f6, #7c3aed, #06b6d4, #3b82f6)",
        mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMask:
          "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        maskComposite: "exclude",
        WebkitMaskComposite: "destination-out",
        padding: "4px",
      }}
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
    >
      <motion.div
        className="absolute w-20 h-20 rounded-full bg-blue-500 blur-2xl opacity-50"
        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.25, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-20 text-blue-400 drop-shadow-[0_0_25px_rgba(59,130,246,0.9)]"
      >
        <Building2 size={62} strokeWidth={2.5} color="#3b82f6" />
      </motion.div>
    </motion.div>
  );
}
