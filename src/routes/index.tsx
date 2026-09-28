import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/landing/SiteNav";
import { Hero } from "@/components/landing/Hero";
import { CoreIdea, SixExperiences, ShopTheExperience } from "@/components/landing/Experiences";
import { WhyItMatters, EngagementLoop, InfluencerCommerce } from "@/components/landing/Evidence";
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

const title = "AtelierAI — AI try-on experiences for Shopify fashion brands";
const description =
  "Turn your Shopify catalog into an interactive AI fashion experience: try-ons, looks, scenes and influencer content that sells.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
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
