import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useTheme } from "next-themes";
import {
  User,
  Mail,
  CreditCard,
  Sun,
  Moon,
  Monitor,
  LogOut,
  Save,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { t } from "@/i18n";

export default function Profile() {
  const { user, isAuthenticated, isLoading, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isSaving, setIsSaving] = useState(false);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    updateUser({ username, email });
    setIsSaving(false);
    toast.success(t("profile.toastUpdatedTitle"), {
      description: t("profile.toastUpdatedDescription"),
    });
  };

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <Layout showFooter={false}>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{t("profile.title")}</h1>
          <p className="text-muted-foreground mb-8">
            {t("profile.subtitle")}
          </p>

          <div className="space-y-6">
            {/* Personal Info */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                {t("profile.personalInfoTitle")}
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">{t("profile.usernameLabel")}</Label>
                  <Input
                    id="username"
                    value={username}
                    readOnly
                    className="h-12 bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("profile.emailLabel")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    readOnly
                    className="h-12 bg-muted"
                  />
                </div>
                {/* <Button
                  variant="gradient"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button> */}
              </div>
            </Card>

            {/* Plan */}
            {/* <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Subscription
              </h2>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted">
                <div>
                  <p className="font-medium capitalize">{user?.plan} Plan</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.plan === "free"
                      ? "5 videos per month"
                      : user?.plan === "pro"
                        ? "Unlimited videos"
                        : "Custom limits"}
                  </p>
                </div>
                <Button variant="outline">Upgrade</Button>
              </div>
            </Card> */}

            {/* Theme */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">{t("profile.appearanceTitle")}</h2>
              <div className="grid grid-cols-3 gap-3">
                {themeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                      }`}
                  >
                    <option.icon className="w-6 h-6" />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Logout */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                {t("profile.accountActionsTitle")}
              </h2>
              <Button variant="destructive" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                {t("profile.logoutButton")}
              </Button>
            </Card>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
