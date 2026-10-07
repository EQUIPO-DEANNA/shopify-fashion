import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/landing/SiteNav";
import { Hero } from "@/components/landing/Hero";
import { CoreIdea, SixExperiences, ShopTheExperience } from "@/components/landing/Experiences";
import { WhyItMatters, EngagementLoop, InfluencerCommerce } from "@/components/landing/Evidence";
import { Examples } from "@/components/landing/Examples";
import { ThreeThings, Wizard } from "@/components/landing/Setup";
import {
  Pricing,
  Credits,
  Analytics,
  SplitTest,
  MobileTrio,
  FinalCTA,
  Footer,
} from "@/components/landing/Closing";
import { t } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  // Read through `t` at match time, so the tab follows the language toggle.
  head: () => {
    const title = t("Deanna Fashion — Experiencias de moda con IA para marcas en Shopify");
    const description = t(
      "Convierte tu catálogo de Shopify en una experiencia de moda con IA: probador, looks, escenas y contenido con embajadores que vende.",
    );
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: Index,
});

function Index() {
  return (
    <main>
      <SiteNav />
      <Hero />
      <CoreIdea />
      <SixExperiences />
      <ShopTheExperience />
      <WhyItMatters />
      <EngagementLoop />
      <InfluencerCommerce />
      <Examples />
      <ThreeThings />
      <Wizard />
      <Pricing />
      <Credits />
      <Analytics />
      <SplitTest />
      <MobileTrio />
      <FinalCTA />
      <Footer />
    </main>
  );
}
