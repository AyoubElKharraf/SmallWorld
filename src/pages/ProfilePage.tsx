import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Eye, EyeOff, Plane } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfileActivity } from "@/components/ProfileActivity";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { useAuth } from "@/contexts/AuthContext";
import { staggerContainer, staggerItem } from "@/lib/motion";

const ProfilePage = () => {
  const { t, i18n } = useTranslation();
  const { user, updateProfile, changePassword, refreshUser } = useAuth();

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePending, setProfilePending] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordPending, setPasswordPending] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const nameTrim = name.trim();
    const emailTrim = email.trim().toLowerCase();
    if (!nameTrim) {
      toast.error(t("profile.nameRequired"));
      return;
    }
    if (nameTrim === user.name && emailTrim === user.email) {
      toast.message(t("profile.noChanges"));
      return;
    }
    setProfilePending(true);
    try {
      const payload: { name?: string; email?: string } = {};
      if (nameTrim !== user.name) payload.name = nameTrim;
      if (emailTrim !== user.email) payload.email = emailTrim;
      await updateProfile(payload);
      toast.success(t("profile.saved"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("profile.error"));
    } finally {
      setProfilePending(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error(t("profile.passwordTooShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t("profile.passwordMismatch"));
      return;
    }
    setPasswordPending(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success(t("profile.passwordChanged"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("profile.error"));
    } finally {
      setPasswordPending(false);
    }
  };

  const createdLabel = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(i18n.language?.startsWith("en") ? "en" : "fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  if (!user) return null;

  return (
    <PageShell variant="narrow" className="pb-16 pt-8">
      <motion.div
        className="space-y-10"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={staggerItem}>
          <PageHeader
            align="center"
            icon={Plane}
            title={t("profile.title")}
            description={
              <>
                <span className="block">{t("profile.subtitle")}</span>
                {createdLabel && (
                  <span className="mt-2 block text-xs text-muted-foreground">
                    {t("profile.memberSince")} {createdLabel}
                  </span>
                )}
              </>
            }
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <ProfileActivity />
        </motion.div>

        <motion.form
          variants={staggerItem}
          onSubmit={handleProfileSubmit}
          className="space-y-4 rounded-2xl border border-border/80 bg-card/80 p-6 shadow-md shadow-foreground/[0.04] ring-1 ring-border/50 backdrop-blur-sm md:p-8"
        >
          <h2 className="font-serif text-lg text-foreground">{t("profile.identity")}</h2>
          <div className="space-y-2">
            <Label htmlFor="profile-name">{t("profile.name")}</Label>
            <Input
              id="profile-name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-email">{t("profile.email")}</Label>
            <Input
              id="profile-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11"
            />
          </div>
          <p className="text-xs text-muted-foreground">{t("profile.roleLabel")}: {user.role}</p>
          <Button type="submit" className="h-11 w-full" disabled={profilePending}>
            {profilePending ? t("profile.saving") : t("profile.save")}
          </Button>
        </motion.form>

        <motion.form
          variants={staggerItem}
          onSubmit={handlePasswordSubmit}
          className="space-y-4 rounded-2xl border border-border/80 bg-card/80 p-6 shadow-md shadow-foreground/[0.04] ring-1 ring-border/50 backdrop-blur-sm md:p-8"
        >
          <h2 className="font-serif text-lg text-foreground">{t("profile.passwordSection")}</h2>
          <div className="space-y-2">
            <Label htmlFor="current-pw">{t("profile.currentPassword")}</Label>
            <div className="relative">
              <Input
                id="current-pw"
                type={showCurrent ? "text" : "password"}
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="h-11 pr-10"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setShowCurrent((v) => !v)}
                aria-label={showCurrent ? t("profile.hidePassword") : t("profile.showPassword")}
              >
                {showCurrent ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-pw">{t("profile.newPassword")}</Label>
            <div className="relative">
              <Input
                id="new-pw"
                type={showNew ? "text" : "password"}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
                className="h-11 pr-10"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setShowNew((v) => !v)}
                aria-label={showNew ? t("profile.hidePassword") : t("profile.showPassword")}
              >
                {showNew ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-pw">{t("profile.confirmPassword")}</Label>
            <div className="relative">
              <Input
                id="confirm-pw"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
                className="h-11 pr-10"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? t("profile.hidePassword") : t("profile.showPassword")}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
              </button>
            </div>
          </div>
          <Button type="submit" variant="secondary" className="h-11 w-full" disabled={passwordPending}>
            {passwordPending ? t("profile.updatingPassword") : t("profile.updatePassword")}
          </Button>
        </motion.form>
      </motion.div>
    </PageShell>
  );
};

export default ProfilePage;
