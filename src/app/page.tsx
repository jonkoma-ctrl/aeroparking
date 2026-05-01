import { Hero } from "@/components/landing/Hero";
import { ServiceSelector } from "@/components/landing/ServiceSelector";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Benefits } from "@/components/landing/Benefits";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServiceSelector />
      <HowItWorks />
      <Benefits />
      <FAQ />
      <CTA />
    </>
  );
}
