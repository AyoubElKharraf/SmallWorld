import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { pageContent, pageTransition } from "@/lib/motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SkipLink } from "@/components/SkipLink";

const MainLayout = () => {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const navbarVariant = isHome ? "hero" : "solid";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SkipLink />
      <Navbar variant={navbarVariant} />
      <main id="main-content" tabIndex={-1} className={cn("flex-1 w-full outline-none", !isHome && "pt-16")}>
        <motion.div
          key={pathname}
          initial="initial"
          animate="animate"
          variants={pageContent}
          transition={pageTransition}
          className="flex min-h-0 w-full flex-1 flex-col"
        >
          <Outlet />
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
