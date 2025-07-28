import React, { useMemo } from "react";
import { motion } from "framer-motion";

export const ParticleLine = React.memo(({ count }: { count: number }) => {
  const connectionLineHeight = (count - 1) * 96 + 32;

  const particles = useMemo(() => Array.from({ length: 5 }), []);

  if (count <= 1) return null;
  return (
    <motion.div
      className="absolute top-0 w-0.5 pointer-events-none left-1/2 -translate-x-1/2"
      initial={{ height: 0 }}
      animate={{ height: connectionLineHeight }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
    >
      <div className="absolute inset-0 w-0.5 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent" />
      <div className="absolute inset-0 w-4 -left-[7px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-sm" />
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 left-[-1.5px] bg-primary rounded-full shadow-[0_0_6px_var(--color-primary)]"
          animate={{ top: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 2 + count * 0.3,
            repeat: Infinity,
            delay: i * 0.6,
            ease: "linear",
          }}
        />
      ))}
    </motion.div>
  );
});

ParticleLine.displayName = "ParticleLine";
