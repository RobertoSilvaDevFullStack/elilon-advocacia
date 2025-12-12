import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { AREAS } from "../constants";

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
    "inline-flex items-center justify-center px-8 py-3 text-sm font-semibold uppercase tracking-wider transition-all duration-300 group";

  const variants = {
    primary: "bg-gold-600 text-white hover:bg-neutral-900",
    outline:
      "border border-gold-600 text-gold-600 hover:bg-gold-600 hover:text-white",
    text: "text-neutral-900 hover:text-gold-600 p-0",
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
          light ? "text-gold-400" : "text-gold-600"
        }`}
      >
        {subtitle}
      </span>
    )}
    <h2
      className={`text-3xl md:text-4xl font-serif font-medium ${
        light ? "text-white" : "text-neutral-900"
      }`}
    >
      {title}
    </h2>
    <div className={`h-1 w-20 bg-gold-500 mt-4 ${centered ? "mx-auto" : ""}`} />
  </div>
);

export const ContactForm: React.FC<{ source?: string }> = ({
  source = "General",
}) => {
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would post to an API
    setTimeout(() => setSubmitted(true), 1000);
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 p-8 text-center rounded-sm">
        <h3 className="text-xl font-serif text-green-800 mb-2">
          Mensagem Enviada!
        </h3>
        <p className="text-green-700">
          Agradecemos o contato. Retornaremos em breve.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-4 text-sm font-bold underline text-green-800"
        >
          Enviar nova mensagem
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          required
          type="text"
          placeholder="Nome Completo"
          className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 focus:outline-none focus:border-gold-500 transition-colors"
        />
        <input
          required
          type="email"
          placeholder="E-mail"
          className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 focus:outline-none focus:border-gold-500 transition-colors"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          required
          type="tel"
          placeholder="Telefone / WhatsApp"
          className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 focus:outline-none focus:border-gold-500 transition-colors"
        />
        <input
          type="text"
          placeholder="Cidade / Estado"
          className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 focus:outline-none focus:border-gold-500 transition-colors"
        />
      </div>
      <select className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 focus:outline-none focus:border-gold-500 transition-colors text-neutral-500">
        <option value="">Área de Interesse</option>
        {AREAS.map((area) => (
          <option key={area.id} value={area.slug}>
            {area.title}
          </option>
        ))}
        <option value="outros">Outros</option>
      </select>
      <textarea
        required
        rows={4}
        placeholder="Mensagem"
        className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 focus:outline-none focus:border-gold-500 transition-colors"
      ></textarea>

      <div className="flex items-start gap-2">
        <input required type="checkbox" id="lgpd" className="mt-1" />
        <label htmlFor="lgpd" className="text-xs text-neutral-500">
          Concordo com o tratamento dos meus dados conforme a Política de
          Privacidade e LGPD.
        </label>
      </div>

      <Button type="submit" className="w-full md:w-auto">
        Enviar Mensagem
      </Button>
    </form>
  );
};

export const Hero: React.FC<{
  title: string;
  subtitle: string;
  image: string;
  children?: React.ReactNode;
  height?: "full" | "large" | "small";
}> = ({ title, subtitle, image, children, height = "large" }) => {
  const heightClass =
    height === "full"
      ? "h-screen"
      : height === "large"
      ? "h-[70vh]"
      : "h-[50vh]";

  return (
    <section
      className={`relative ${heightClass} flex items-center justify-center overflow-hidden bg-neutral-900`}
    >
      <div className="absolute inset-0 z-0 opacity-50">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="container relative z-10 px-4 text-center text-white">
        <span className="block text-gold-400 font-bold uppercase tracking-[0.3em] mb-4 text-sm md:text-base animate-fade-in-up">
          {subtitle}
        </span>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium leading-tight mb-8 max-w-4xl mx-auto">
          {title}
        </h1>
        {children}
      </div>
    </section>
  );
};
