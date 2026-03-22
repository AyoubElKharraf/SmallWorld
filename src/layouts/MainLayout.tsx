import { Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
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
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
