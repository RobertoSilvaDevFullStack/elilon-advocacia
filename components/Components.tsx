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
    primary:
      "bg-gradient-to-r from-accent-600 to-accent-500 text-white hover:shadow-lg hover:shadow-accent-500/50 hover:scale-105 transform",
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

export const ContactForm: React.FC<{ source?: string }> = ({
  source = "General",
}) => {
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      city: formData.get("city"),
      area: formData.get("area"),
      message: formData.get("message"),
      source,
    };

    try {
      const response = await fetch("http://localhost:5000/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar mensagem");
      }

      setSubmitted(true);
    } catch (err) {
      setError("Erro ao enviar mensagem. Por favor, tente novamente.");
      console.error("Error submitting form:", err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 p-8 text-center rounded-sm">
        <h3 className="text-xl font-headline text-green-800 mb-2">
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
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 text-red-700 text-sm rounded">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          required
          type="text"
          name="name"
          placeholder="Nome Completo"
          className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 focus:outline-none focus:border-accent-500 transition-colors"
        />
        <input
          required
          type="email"
          name="email"
          placeholder="E-mail"
          className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 focus:outline-none focus:border-accent-500 transition-colors"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          required
          type="tel"
          name="phone"
          placeholder="Telefone / WhatsApp"
          className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 focus:outline-none focus:border-accent-500 transition-colors"
        />
        <input
          type="text"
          name="city"
          placeholder="Cidade / Estado"
          className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 focus:outline-none focus:border-accent-500 transition-colors"
        />
      </div>
      <select
        name="area"
        className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 focus:outline-none focus:border-accent-500 transition-colors text-neutral-500"
      >
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
        name="message"
        rows={4}
        placeholder="Mensagem"
        className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 focus:outline-none focus:border-accent-500 transition-colors"
      ></textarea>

      <div className="flex items-start gap-2">
        <input required type="checkbox" id="lgpd" className="mt-1" />
        <label htmlFor="lgpd" className="text-xs text-neutral-500">
          Concordo com o tratamento dos meus dados conforme a Política de
          Privacidade e LGPD.
        </label>
      </div>

      <Button type="submit" className="w-full md:w-auto" disabled={loading}>
        {loading ? "Enviando..." : "Enviar Mensagem"}
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
  imagePosition?: string;
}> = ({
  title,
  subtitle,
  image,
  children,
  height = "large",
  imagePosition = "center",
}) => {
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
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          style={{ objectPosition: imagePosition }}
        />
      </div>
      <div className="container relative z-10 px-4 text-center text-white pt-20 md:pt-0">
        <span className="block text-accent-400 font-bold uppercase tracking-[0.3em] mb-4 text-sm md:text-base animate-fade-in-up">
          {subtitle}
        </span>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline font-medium leading-tight mb-8 max-w-4xl mx-auto">
          {title}
        </h1>
        {children}
      </div>
    </section>
  );
};
