"use client";

import { useState } from "react";
import { FAQ_ITEMS } from "@/lib/constants";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="section-padding bg-brand-50">
      <div className="container-main">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
            Preguntas frecuentes
          </h2>
          <p className="mt-4 text-lg text-brand-500">
            Todo lo que necesitás saber antes de reservar.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-3xl space-y-3">
          {FAQ_ITEMS.map((item, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl border border-brand-200 bg-white"
            >
              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                className="flex w-full items-center justify-between px-6 py-4 text-left"
                aria-expanded={openIndex === index}
              >
                <span className="pr-4 text-sm font-semibold text-brand-900">
                  {item.question}
                </span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-brand-400 transition-transform duration-200",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all duration-200",
                  openIndex === index
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-4 text-sm leading-relaxed text-brand-500">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
