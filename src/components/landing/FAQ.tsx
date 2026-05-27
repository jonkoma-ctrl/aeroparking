"use client";

import { useState } from "react";
import Link from "next/link";
import { FAQ_ITEMS } from "@/lib/constants";
import { ChevronDown, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // primera abierta por default

  return (
    <section id="faq" className="section-padding bg-white">
      <div className="container-main">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
            Preguntas frecuentes
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-brand-900 text-balance sm:text-4xl lg:text-5xl">
            Todo lo que necesitás saber
          </h2>
          <p className="mt-3 text-base text-brand-600 sm:text-lg">
            ¿No encontrás tu duda? Consultanos por WhatsApp y te respondemos a la brevedad.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl space-y-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={cn(
                  "overflow-hidden rounded-2xl border bg-white transition-all",
                  isOpen
                    ? "border-brand-300 shadow-soft"
                    : "border-brand-100 hover:border-brand-200"
                )}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-brand-900 sm:text-base">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-brand-500 transition-transform duration-200",
                      isOpen && "rotate-180 text-brand-700"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-brand-100 px-5 py-4 text-sm leading-relaxed text-brand-700 sm:px-6">
                      {item.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Card de contacto al final */}
        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-brand-200 bg-brand-50 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#25d366] text-white">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg font-bold text-brand-900">
                ¿Quedó alguna duda?
              </h3>
              <p className="mt-1 text-sm text-brand-600">
                Atención humana 24 horas. Te respondemos al toque por WhatsApp.
              </p>
            </div>
            <Link
              href="https://wa.me/5491131606994"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#25d366] px-5 py-2.5 text-sm font-bold text-white shadow-soft transition-all hover:bg-[#1ebe5a] hover:scale-[1.02]"
            >
              Escribir por WhatsApp
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
