import React from "react";
import { ArrowRight } from "lucide-react";
import OptimizedImage from "./OptimizedImage";
import { Link } from "react-router-dom";
import { AREAS } from "../constants/areas";
import { getApiBaseUrl } from "../utils/api";
import { trackLead } from "../utils/tracking";

export { Button } from "./ui/Button";
export { SectionTitle } from "./ui/SectionTitle";

const API_URL = getApiBaseUrl();
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
    const params = new URLSearchParams(window.location.search);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      city: formData.get("city"),
      interest: formData.get("area"),
      message: formData.get("message"),
      source,
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
    };

    try {
      const response = await fetch(`${API_URL}/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar mensagem");
      }

      // Sprint 3.8: dispara Lead apenas após persistência confirmada
      trackLead(source);
      setSubmitted(true);
    } catch {
      setError("Erro ao enviar mensagem. Por favor, tente novamente.");
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

      <div className="flex items-center gap-3 cursor-pointer">
        <input
          required
          type="checkbox"
          id="lgpd"
          className="w-5 h-5 min-w-[20px] accent-accent-500 cursor-pointer"
        />
        <label
          htmlFor="lgpd"
          className="text-xs text-neutral-500 cursor-pointer select-none py-2"
        >
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
        <OptimizedImage
          src={image}
          alt=""
          role="presentation"
          className="w-full h-full object-cover"
          style={{ objectPosition: imagePosition }}
          priority
          width={1920}
          height={1080}
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
