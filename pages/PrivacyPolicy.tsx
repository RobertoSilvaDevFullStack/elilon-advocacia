import React from "react";
import { Layout } from "../components/Layout";
import { SEO } from "../components/SEO";
import { SectionTitle } from "../components/Components";

export const PrivacyPolicy: React.FC = () => {
  return (
    <Layout>
      <SEO
        title="Política de Privacidade"
        description="Termos de privacidade e tratamento de dados do Elilon Lopes Advogados."
      />

      <div className="bg-neutral-900 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-center">
            Política de Privacidade
          </h1>
        </div>
      </div>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl text-neutral-700 leading-relaxed space-y-6">
          <p>
            A sua privacidade é importante para nós. É política do{" "}
            <strong>Elilon Lopes Advogados</strong> respeitar a sua privacidade
            em relação a qualquer informação sua que possamos coletar no site{" "}
            <a
              href="https://eladv.com.br"
              className="text-gold-600 hover:underline"
            >
              Elilon Lopes Advogados
            </a>
            , e outros sites que possuímos e operamos.
          </p>

          <h2 className="text-2xl font-serif font-bold text-neutral-900 mt-8 mb-4">
            1. Informações que coletamos
          </h2>
          <p>
            Solicitamos informações pessoais apenas quando realmente precisamos
            delas para lhe fornecer um serviço. Fazemo-lo por meios justos e
            legais, com o seu conhecimento e consentimento. Também informamos
            por que estamos coletando e como será usado.
          </p>

          <h2 className="text-2xl font-serif font-bold text-neutral-900 mt-8 mb-4">
            2. Uso de Dados
          </h2>
          <p>
            Apenas retemos as informações coletadas pelo tempo necessário para
            fornecer o serviço solicitado. Quando armazenamos dados, protegemos
            dentro de meios comercialmente aceitáveis ​​para evitar perdas e
            roubos, bem como acesso, divulgação, cópia, uso ou modificação não
            autorizados.
          </p>

          <h2 className="text-2xl font-serif font-bold text-neutral-900 mt-8 mb-4">
            3. Compartilhamento de Dados
          </h2>
          <p>
            Não compartilhamos informações de identificação pessoal publicamente
            ou com terceiros, exceto quando exigido por lei.
          </p>

          <h2 className="text-2xl font-serif font-bold text-neutral-900 mt-8 mb-4">
            4. Cookies
          </h2>
          <p>
            O nosso site pode usar cookies para melhorar a experiência do
            usuário. Você é livre para recusar a nossa solicitação de
            informações pessoais, entendendo que talvez não possamos fornecer
            alguns dos serviços desejados.
          </p>

          <h2 className="text-2xl font-serif font-bold text-neutral-900 mt-8 mb-4">
            5. Compromisso do Usuário
          </h2>
          <p>
            O usuário se compromete a fazer uso adequado dos conteúdos e da
            informação que o Elilon Lopes Advogados oferece no site e com
            caráter enunciativo, mas não limitativo:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              A) Não se envolver em atividades que sejam ilegais ou contrárias à
              boa fé a à ordem pública;
            </li>
            <li>
              B) Não difundir propaganda ou conteúdo de natureza racista,
              xenofóbica, ou azar, qualquer tipo de pornografia ilegal, de
              apologia ao terrorismo ou contra os direitos humanos;
            </li>
            <li>
              C) Não causar danos aos sistemas físicos (hardwares) e lógicos
              (softwares) do Elilon Lopes Advogados, de seus fornecedores ou
              terceiros.
            </li>
          </ul>

          <p className="mt-8 text-sm italic border-t border-neutral-200 pt-8">
            Esta política é efetiva a partir de{" "}
            <strong>Dezembro de 2025</strong>.
          </p>
        </div>
      </section>
    </Layout>
  );
};
