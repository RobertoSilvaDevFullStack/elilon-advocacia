import React from "react";

export const SectionTitle: React.FC<{
  title: string;
  subtitle?: string;
  centered?: boolean;
  light?: boolean;
}> = ({ title, subtitle, centered, light }) => (
  <div className={`mb-12 ${centered ? "text-center" : ""}`}>
    {subtitle && (
      <span
        className={`block text-xs font-bold uppercase tracking-[0.2em] mb-3 ${
          light ? "text-accent-400" : "text-accent-600"
        }`}
      >
        {subtitle}
      </span>
    )}
    <h2
      className={`text-3xl md:text-4xl font-headline font-medium ${
        light ? "text-white" : "text-neutral-900"
      }`}
    >
      {title}
    </h2>
    <div
      className={`h-1 w-20 bg-gradient-to-r from-accent-500 to-navy-500 mt-4 ${
        centered ? "mx-auto" : ""
      }`}
    />
  </div>
);
