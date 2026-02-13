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
import heroOriginalVideo from "@/videos/videoplayback.mp4";
import heroShortVideo from "@/videos/328740_small.mp4";

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
        <div className="container mx-auto px-4 py-12 md:py-16">
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
                <Button variant="gradient" size="xl">
                  {t("hero.primaryCta")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" size="xl">
                <Play className="w-5 h-5 mr-2" />
                {t("hero.secondaryCta")}
              </Button>
            </div>
          </motion.div>

          {/* Hero Visual */}
          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 relative flex justify-center -mb-20 md:-mb-28"
          >
            <div className="relative rounded-2xl card-shadow glow max-w-6xl w-full">
              <div className="bg-card border border-border/50 rounded-2xl p-4 md:p-8 flex flex-col gap-6">

                {/* ORIGINAL VIDEO (SOURCE) */}
                <div className="relative rounded-xl overflow-hidden aspect-[21/9] max-h-[280px]">
                  <video
                    src={heroShortVideo}
                    className="w-full h-full object-contain"
                    muted
                    loop
                    playsInline
                    autoPlay
                  />

                  {/* Compression flash */}
                  <motion.div
                    className="absolute inset-0 bg-primary/10 pointer-events-none"
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  />
                </div>

                {/* DROP ZONE */}
                <motion.div
                  className="flex justify-center gap-4 flex-wrap"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.15,
                        delayChildren: 0.6,
                      },
                    },
                  }}
                >
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      variants={{
                        hidden: {
                          opacity: 0,
                          y: -140,
                          scaleY: 0.2,
                          scaleX: 0.9,
                          clipPath: "inset(40% 25% 40% 25% round 16px)",
                        },
                        visible: {
                          opacity: 1,
                          y: 0,
                          scaleY: [0.2, 1.05, 1],
                          scaleX: [0.9, 1, 1],
                          clipPath: "inset(0% 0% 0% 0% round 16px)",
                        },
                      }}
                      transition={{
                        duration: 0.9,
                        ease: [0.22, 1, 0.36, 1], // gravity feel
                      }}
                      className="relative bg-muted rounded-xl overflow-hidden aspect-[9/16] w-full max-w-[180px] md:max-w-[220px]"
                    >
                      <video
                        src={heroOriginalVideo}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                        autoPlay
                      />
                    </motion.div>
                  ))}
                </motion.div>
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
                <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
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

            <Link to={isAuthenticated ? "/upload" : "/signup"}>
              <Button variant="gradient" size="xl">
                {t("cta.primaryCta")}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>

            <div className="flex justify-center gap-6 mt-6 text-sm text-muted-foreground">
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
