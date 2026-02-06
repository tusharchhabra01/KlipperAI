import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { t } from "@/i18n";
import {
  Sparkles,
  Zap,
  Download,
  BarChart3,
  ArrowRight,
  Play,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Sparkles,
    title: t("features.aiPoweredClippingTitle"),
    description: t("features.aiPoweredClippingDescription"),
  },
  {
    icon: Zap,
    title: t("features.lightningFastTitle"),
    description: t("features.lightningFastDescription"),
  },
  {
    icon: Download,
    title: t("features.easyExportTitle"),
    description: t("features.easyExportDescription"),
  },
  {
    icon: BarChart3,
    title: t("features.smartDashboardTitle"),
    description: t("features.smartDashboardDescription"),
  },
];

const steps = [
  { step: 1, title: t("howItWorks.step1Title"), description: t("howItWorks.step1Description") },
  { step: 2, title: t("howItWorks.step2Title"), description: t("howItWorks.step2Description") },
  { step: 3, title: t("howItWorks.step3Title"), description: t("howItWorks.step3Description") },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">

        <div className="container mx-auto px-4 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              {t("hero.badge")}
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              {t("hero.titlePrefix")}{" "}
              <span className="gradient-text">{t("hero.titleHighlight")}</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t("hero.descriptionLine1")} {t("hero.descriptionLine2")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={isAuthenticated ? "/upload" : "/signup"}>
                <Button variant="gradient" size="xl" className="w-full sm:w-auto">
                  {t("hero.primaryCta")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" size="xl" className="w-full sm:w-auto">
                <Play className="w-5 h-5 mr-2" />
                {t("hero.secondaryCta")}
              </Button>
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="relative rounded-2xl overflow-hidden card-shadow glow max-w-5xl mx-auto">
              <div className="aspect-video bg-card border border-border/50 rounded-2xl p-4 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                  {/* Original Video Preview */}
                  <div className="md:col-span-2 bg-muted rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4">
                        <Play className="w-8 h-8 text-primary-foreground" />
                      </div>
                      <p className="text-muted-foreground">{t("hero.originalVideoLabel")}</p>
                    </div>
                  </div>
                  {/* Shorts Preview */}
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-muted rounded-xl aspect-[9/16] flex items-center justify-center"
                      >
                        <span className="text-xs text-muted-foreground">
                          {t("hero.shortLabel").replace("{{index}}", String(i))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("howItWorks.title")}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {t("howItWorks.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-full h-[2px] bg-gradient-to-r from-primary/50 to-transparent" />
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("features.sectionTitle")}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {t("features.sectionSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-card border border-border/50 card-shadow hover:glow transition-shadow duration-300"
              >
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-10" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              {t("cta.title")}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t("cta.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link to={isAuthenticated ? "/upload" : "/signup"}>
                <Button variant="gradient" size="xl">
                  {t("cta.primaryCta")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                {t("cta.noCardRequired")}
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                {t("cta.cancelAnytime")}
              </span>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
