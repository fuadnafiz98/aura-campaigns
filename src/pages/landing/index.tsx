import BentoGrid from "@/components/sections/bento-grid";
import CTA from "@/components/sections/cta/default";
import FAQ from "@/components/sections/faq/default";
import Features from "@/components/sections/features/default";
import FooterSection from "@/components/sections/footer/default";
import Hero from "@/components/sections/hero/default";
import Logos from "@/components/sections/logos/default";
import Navbar from "@/components/sections/navbar/default";
import Pricing from "@/components/sections/pricing/default";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Logos />
      <BentoGrid />
      <Features />
      <Pricing />
      <FAQ />
      <CTA />
      <FooterSection />
    </div>
  );
}
