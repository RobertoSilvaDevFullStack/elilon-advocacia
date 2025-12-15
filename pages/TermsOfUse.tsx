import React from "react";
import { Layout } from "../components/Layout";
import { SEO } from "../components/SEO";

export const TermsOfUse: React.FC = () => {
  return (
    <Layout>
      <SEO
        title="Termos de Uso"
        description="Termos e condições de uso do site Elilon Lopes Advogados."
      />

      <div className="bg-neutral-900 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-center">
            Termos de Uso
          </h1>
        </div>
      </div>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl text-neutral-700 leading-relaxed space-y-6">
          <h2 className="text-2xl font-headline font-bold text-neutral-900 mt-8 mb-4">
            1. Termos
          </h2>
          <p>
            Ao acessar o site{" "}
            <a
              href="https://eladv.com.br"
              className="text-accent-600 hover:underline"
            >
              Elilon Lopes Advogados
            </a>
            , concorda em cumprir estes termos de serviço, todas as leis e
            regulamentos aplicáveis ​​e concorda que é responsável pelo
            cumprimento de todas as leis locais aplicáveis. Se você não
            concordar com algum desses termos, está proibido de usar ou acessar
            este site.
          </p>

          <h2 className="text-2xl font-headline font-bold text-neutral-900 mt-8 mb-4">
            2. Uso de Licença
          </h2>
          <p>
            É concedida permissão para baixar temporariamente uma cópia dos
            materiais (informações ou software) no site Elilon Lopes Advogados,
            apenas para visualização transitória pessoal e não comercial. Esta é
            a concessão de uma licença, não uma transferência de título e, sob
            esta licença, você não pode:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>modificar ou copiar os materiais;</li>
            <li>
              usar os materiais para qualquer finalidade comercial ou para
              exibição pública (comercial ou não comercial);
            </li>
            <li>
              tentar descompilar ou fazer engenharia reversa de qualquer
              software contido no site Elilon Lopes Advogados;
            </li>
            <li>
              remover quaisquer direitos autorais ou outras notações de
              propriedade dos materiais; ou
            </li>
            <li>
              transferir os materiais para outra pessoa ou 'espelhe' os
              materiais em qualquer outro servidor.
            </li>
          </ul>

          <h2 className="text-2xl font-headline font-bold text-neutral-900 mt-8 mb-4">
            3. Isenção de responsabilidade
          </h2>
          <p>
            Os materiais no site da Elilon Lopes Advogados são fornecidos 'como
            estão'. Elilon Lopes Advogados não oferece garantias, expressas ou
            implícitas, e, por este meio, isenta e nega todas as outras
            garantias, incluindo, sem limitação, garantias implícitas ou
            condições de comercialização, adequação a um fim específico ou não
            violação de propriedade intelectual ou outra violação de direitos.
          </p>

          <h2 className="text-2xl font-headline font-bold text-neutral-900 mt-8 mb-4">
            4. Limitações
          </h2>
          <p>
            Em nenhum caso o Elilon Lopes Advogados ou seus fornecedores serão
            responsáveis ​​por quaisquer danos (incluindo, sem limitação, danos
            por perda de dados ou lucro ou devido a interrupção dos negócios)
            decorrentes do uso ou da incapacidade de usar os materiais em Elilon
            Lopes Advogados, mesmo que Elilon Lopes Advogados ou um
            representante autorizado da Elilon Lopes Advogados tenha sido
            notificado oralmente ou por escrito da possibilidade de tais danos.
          </p>

          <h2 className="text-2xl font-headline font-bold text-neutral-900 mt-8 mb-4">
            5. Precisão dos materiais
          </h2>
          <p>
            Os materiais exibidos no site da Elilon Lopes Advogados podem
            incluir erros técnicos, tipográficos ou fotográficos. Elilon Lopes
            Advogados não garante que qualquer material em seu site seja
            preciso, completo ou atual. Elilon Lopes Advogados pode fazer
            alterações nos materiais contidos em seu site a qualquer momento,
            sem aviso prévio.
          </p>

          <h2 className="text-2xl font-headline font-bold text-neutral-900 mt-8 mb-4">
            6. Links
          </h2>
          <p>
            O Elilon Lopes Advogados não analisou todos os sites vinculados ao
            seu site e não é responsável pelo conteúdo de nenhum site vinculado.
            A inclusão de qualquer link não implica endosso por Elilon Lopes
            Advogados do site. O uso de qualquer site vinculado é por conta e
            risco do usuário.
          </p>

          <p className="mt-8 text-sm italic border-t border-neutral-200 pt-8">
            Esta política é efetiva a partir de{" "}
            <strong>Dezembro de 2025</strong>.
          </p>
        </div>
      </section>
    </Layout>
  );
};
