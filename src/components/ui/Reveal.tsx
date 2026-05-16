"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** delay en ms para escalonar staggers */
  delay?: number;
  /** distancia en px que se desplaza desde abajo. Default 24 */
  distance?: number;
  /** duración en ms. Default 700 */
  duration?: number;
  /** tag wrapper. Default div */
  as?: "div" | "section" | "article" | "li" | "span";
  className?: string;
}

/**
 * Wrapper que aplica fade-up cuando el elemento entra en el viewport.
 * Usa IntersectionObserver — cero dependencias, ~1KB de código.
 *
 * Respeta `prefers-reduced-motion`: si el usuario lo tiene activado, el
 * contenido aparece sin animación.
 */
export function Reveal({
  children,
  delay = 0,
  distance = 24,
  duration = 700,
  as: Tag = "div",
  className = "",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            obs.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reducedMotion]);

  const style: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translate3d(0,0,0)" : `translate3d(0,${distance}px,0)`,
    transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
    willChange: visible ? "auto" : "opacity, transform",
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Component = Tag as any;
  return (
    <Component ref={ref} className={className} style={style}>
      {children}
    </Component>
  );
}
