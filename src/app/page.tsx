import { Hero } from "@/components/landing/Hero";
import { ServiceSelector } from "@/components/landing/ServiceSelector";
import { AeroparqueServices } from "@/components/landing/AeroparqueServices";
import { CruiseService } from "@/components/landing/CruiseService";
import { Benefits } from "@/components/landing/Benefits";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServiceSelector />
      <AeroparqueServices />
      <CruiseService />
      <Benefits />
      <FAQ />
      <CTA />
    </>
  );
}
