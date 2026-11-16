import { Hero } from "@/components/landing/Hero";
import { BookingWidget } from "@/components/booking-widget/BookingWidget";
import { TrustBar } from "@/components/landing/TrustBar";
import { ServiceSelector } from "@/components/landing/ServiceSelector";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PriceGrid } from "@/components/landing/PriceGrid";
import { OurFacility } from "@/components/landing/OurFacility";
import { Benefits } from "@/components/landing/Benefits";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return (
    <>
      <Hero />
      <BookingWidget variant="hero" entryPoint="home_hero" />
      <TrustBar />
      <ServiceSelector />
      <HowItWorks />
      <PriceGrid />
      <OurFacility />
      <Benefits />
      <Testimonials />
      <FAQ />
      <CTA />
    </>
  );
}
