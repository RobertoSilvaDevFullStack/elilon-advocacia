import React from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?:
    | "fade-in-up"
    | "fade-in"
    | "slide-in-left"
    | "slide-in-right"
    | "scale-up";
  delay?: "delay-100" | "delay-200" | "delay-300" | "delay-400" | "delay-500";
  className?: string;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  animation = "fade-in-up",
  delay,
  className = "",
}) => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${
        isVisible ? `scroll-reveal-visible ${animation}` : ""
      } ${delay || ""} ${className}`}
    >
      {children}
    </div>
  );
};
