import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Plane, Menu, X, LogOut, LayoutDashboard, User, CircleUser } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import NotificationBell from "@/components/NotificationBell";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavbarProps = { variant?: "hero" | "solid" };

const Navbar = ({ variant = "hero" }: NavbarProps) => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const isSolid = variant === "solid";

  const shell = cn(
    "fixed top-0 left-0 right-0 z-50 border-b",
    isSolid
      ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-border"
      : "bg-foreground/10 backdrop-blur-md border-primary-foreground/10"
  );

  const navLinkBase = cn(
    "transition-colors text-sm",
    isSolid ? "text-muted-foreground hover:text-foreground" : "text-primary-foreground/70 hover:text-primary-foreground"
  );

  const navLinkActive = isSolid ? "text-foreground font-medium" : "text-primary-foreground font-medium";

  const logoClass = isSolid ? "text-foreground" : "text-primary-foreground";

  const mainNav = (to: string, label: string) => (
    <NavLink
      to={to}
      className={({ isActive }) => cn(navLinkBase, isActive && navLinkActive)}
      onClick={() => setOpen(false)}
    >
      {label}
    </NavLink>
  );

  return (
    <nav className={shell} aria-label={t("nav.menu")}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className={cn("flex items-center gap-2 shrink-0", logoClass)}>
          <Plane className="w-5 h-5" aria-hidden />
          <span className="font-serif text-xl tracking-tight">{t("brand")}</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {mainNav("/destinations", t("nav.destinations"))}
          {mainNav("/assistant", t("nav.assistant"))}
          {mainNav("/carte", t("nav.carte"))}
        </div>

        <div className="hidden md:flex items-center gap-1">
          <LanguageSwitcher variant={isSolid ? "solid" : "hero"} />
          <NotificationBell navVariant={isSolid ? "solid" : "hero"} />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-2",
                    isSolid ? "text-foreground hover:bg-muted" : "text-primary-foreground hover:bg-primary-foreground/10"
                  )}
                  aria-label={t("nav.userMenu")}
                >
                  <User className="w-4 h-4" aria-hidden />
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                  {user.email}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profil" className="cursor-pointer">
                    <CircleUser className="w-4 h-4 mr-2" aria-hidden />
                    {t("nav.profile")}
                  </Link>
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="cursor-pointer">
                      <LayoutDashboard className="w-4 h-4 mr-2" aria-hidden />
                      {t("nav.admin")}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" aria-hidden />
                  {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className={isSolid ? "" : "text-primary-foreground"}>
                <Link to="/login">{t("nav.login")}</Link>
              </Button>
              <Button size="sm" asChild variant={isSolid ? "default" : "secondary"}>
                <Link to="/register">{t("nav.register")}</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitcher variant={isSolid ? "solid" : "hero"} />
          <NotificationBell navVariant={isSolid ? "solid" : "hero"} />
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className={cn(isSolid ? "text-foreground" : "text-primary-foreground")}
            aria-expanded={open}
            aria-controls="mobile-nav-panel"
            aria-label={t("nav.menu")}
          >
            {open ? <X className="w-5 h-5" aria-hidden /> : <Menu className="w-5 h-5" aria-hidden />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={cn(
              "md:hidden border-t overflow-hidden",
              isSolid ? "bg-background border-border" : "bg-foreground/20 border-primary-foreground/10"
            )}
          >
            <div className={cn("px-6 py-4 flex flex-col gap-3 text-sm", navLinkBase)}>
              {mainNav("/destinations", t("nav.destinations"))}
              {mainNav("/assistant", t("nav.assistant"))}
              {mainNav("/carte", t("nav.carte"))}
              <hr className={isSolid ? "border-border" : "border-primary-foreground/20"} />
              {user ? (
                <>
                  <Link to="/profil" onClick={() => setOpen(false)}>
                    {t("nav.profile")}
                  </Link>
                  {user.role === "admin" && (
                    <Link to="/admin" onClick={() => setOpen(false)}>
                      {t("nav.admin")}
                    </Link>
                  )}
                  <button type="button" onClick={() => { logout(); setOpen(false); }} className="text-left">
                    {t("nav.logout")}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)}>
                    {t("nav.login")}
                  </Link>
                  <Link to="/register" onClick={() => setOpen(false)}>
                    {t("nav.register")}
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
