import { HeroSection } from "@/components/hero-section";
import { Categories } from "@/components/categories";
import { HowItWorks } from "@/components/how-it-works";
import { FeaturedProfessionals } from "@/components/featured-professionals";
import { CTASection } from "@/components/cta-section";

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <Categories />
      <HowItWorks />
      <FeaturedProfessionals />
      <CTASection />
    </div>
  );
}
