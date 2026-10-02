import React from "react";
import { ArrowRight } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "text";
}

export const Button: React.FC<ButtonProps> = ({
  className = "",
  variant = "primary",
  children,
  ...props
}) => {
  const baseStyle =
    "inline-flex items-center justify-center px-8 py-3 text-sm font-semibold uppercase tracking-wider transition-colors duration-300 group min-h-[48px] min-w-[48px]";

  const variants = {
    primary:
      "bg-gradient-to-r from-accent-600 to-accent-500 text-white hover:shadow-lg hover:shadow-accent-500/50",
    outline:
      "border-2 border-accent-500 text-accent-500 hover:bg-accent-500 hover:text-white hover:shadow-lg",
    text: "text-neutral-900 hover:text-accent-600 p-0",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
      {variant !== "text" && (
        <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
      )}
    </button>
  );
};
