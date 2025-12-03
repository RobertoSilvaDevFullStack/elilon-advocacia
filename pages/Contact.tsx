import React from 'react';
import { Layout } from '../components/Layout';
import { Hero, ContactForm, SectionTitle } from '../components/Components';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export const Contact: React.FC = () => {
  return (
    <Layout>
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
              <SectionTitle title="Canais de Atendimento" subtitle="Estamos à disposição" />
              <p className="text-neutral-600 mb-8">
                Entre em contato para agendar uma consulta ou tirar dúvidas. Nossa equipe administrativa retornará o mais breve possível.
              </p>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                   <div className="bg-gold-100 p-3 rounded-full text-gold-600">
                     <MapPin size={24} />
                   </div>
                   <div>
                     <h4 className="font-serif text-lg font-bold mb-1">Escritório Central</h4>
                     <p className="text-neutral-600">Av. Mestra Fininha, 1234, Jardim São Luiz</p>
                     <p className="text-neutral-600">Montes Claros - MG, 39400-000</p>
                   </div>
                </div>

                <div className="flex items-start gap-4">
                   <div className="bg-gold-100 p-3 rounded-full text-gold-600">
                     <Phone size={24} />
                   </div>
                   <div>
                     <h4 className="font-serif text-lg font-bold mb-1">Telefone</h4>
                     <p className="text-neutral-600">(38) 3222-0000</p>
                     <p className="text-neutral-500 text-sm">Seg a Sex, das 8h às 18h</p>
                   </div>
                </div>

                <div className="flex items-start gap-4">
                   <div className="bg-gold-100 p-3 rounded-full text-gold-600">
                     <Mail size={24} />
                   </div>
                   <div>
                     <h4 className="font-serif text-lg font-bold mb-1">E-mail</h4>
                     <p className="text-neutral-600">contato@eladv.com.br</p>
                     <p className="text-neutral-600">juridico@eladv.com.br</p>
                   </div>
                </div>
              </div>

              {/* Fake Map */}
              <div className="mt-12 bg-neutral-200 h-64 w-full rounded-lg flex items-center justify-center">
                 <p className="text-neutral-500 font-bold uppercase tracking-widest">[Google Maps Integration]</p>
              </div>
            </div>

            {/* Form Side */}
            <div className="bg-white p-8 md:p-12 shadow-2xl border-t-4 border-gold-500">
              <h3 className="text-2xl font-serif font-bold mb-6">Envie uma mensagem</h3>
              <ContactForm source="Page Contact" />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};