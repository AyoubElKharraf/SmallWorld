/** Courbes et durées alignées sur le reste de l’app (Framer Motion). */
export const easeSmooth = [0.16, 1, 0.3, 1] as const;

export const pageContent = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

export const pageTransition = {
  duration: 0.38,
  ease: easeSmooth,
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 16, filter: "blur(4px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: easeSmooth },
  },
};
