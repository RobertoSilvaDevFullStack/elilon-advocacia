import React from "react";
import { Layout } from "../components/Layout";
import { Hero, ContactForm, SectionTitle } from "../components/Components";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { SEO } from "../components/SEO";

export const Contact: React.FC = () => {
  return (
    <Layout>
      <SEO
        title="Fale Conosco"
        description="Entre em contato com o ELADV. Estamos prontos para atender sua demanda jurídica."
      />
      <Hero
        title="Fale Conosco"
        subtitle="Contato"
        image="https://picsum.photos/1920/1080?grayscale&random=66"
        height="small"
      />

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Info Side */}
            <div>
              <SectionTitle
                title="Canais de Atendimento"
                subtitle="Estamos à disposição"
              />
              <p className="text-neutral-600 mb-8">
                Entre em contato para agendar uma consulta ou tirar dúvidas.
                Nossa equipe administrativa retornará o mais breve possível.
              </p>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="bg-gold-100 p-3 rounded-full text-gold-600">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-bold mb-1">
                      Escritório Central
                    </h4>
                    <p className="text-neutral-600">
                      Av. Mestra Fininha, 1234, Jardim São Luiz
                    </p>
                    <p className="text-neutral-600">
                      Montes Claros - MG, 39400-000
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-gold-100 p-3 rounded-full text-gold-600">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-bold mb-1">
                      Telefone
                    </h4>
                    <p className="text-neutral-600">(38) 3222-0000</p>
                    <p className="text-neutral-500 text-sm">
                      Seg a Sex, das 8h às 18h
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-gold-100 p-3 rounded-full text-gold-600">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-bold mb-1">
                      E-mail
                    </h4>
                    <p className="text-neutral-600">contato@eladv.com.br</p>
                    <p className="text-neutral-600">juridico@eladv.com.br</p>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="mt-12 w-full h-64 rounded-lg overflow-hidden shadow-lg border border-neutral-200">
                <iframe
                  title="Localização do Escritório"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3822.492160537446!2d-43.87186252414757!3d-16.733075253018274!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xab535607da104d%3A0x6769936835de3e3!2sAv.%20Mestra%20Fininha%20da%20Silveira%2C%201234%20-%20Jardim%20S%C3%A3o%20Luiz%2C%20Montes%20Claros%20-%20MG%2C%2039400-000!5e0!3m2!1spt-BR!2sbr!4v1709664000000!5m2!1spt-BR!2sbr"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>

            {/* Form Side */}
            <div className="bg-white p-8 md:p-12 shadow-2xl border-t-4 border-gold-500">
              <h3 className="text-2xl font-serif font-bold mb-6">
                Envie uma mensagem
              </h3>
              <ContactForm source="Page Contact" />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};
