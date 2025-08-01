import BentoGrid from "@/components/sections/bento-grid";
import CTA from "@/components/sections/cta/default";
import FAQ from "@/components/sections/faq/default";
import FooterSection from "@/components/sections/footer/default";
import Hero from "@/components/sections/hero/default";
import Logos from "@/components/sections/logos/default";
import Navbar from "@/components/sections/navbar/default";

export default function LandingPage() {
  return (
    <div className="h-screen">
      <Navbar />
      <Hero />
      <BentoGrid />
      <FAQ />
      <Logos />
      <CTA />
      <FooterSection />
    </div>
  );
}
