import { Hero } from "@/components/landing/Hero";
import { ServicesOverview } from "@/components/landing/ServicesOverview";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Benefits } from "@/components/landing/Benefits";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicesOverview />
      <HowItWorks />
      <Benefits />
      <FAQ />
      <CTA />
    </>
  );
}
