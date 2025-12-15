import React from "react";
import { Layout } from "../components/Layout";
import { Hero } from "../components/Components";
import { BLOG_POSTS } from "../constants";
import { Link } from "react-router-dom";
import { SEO } from "../components/SEO";
import { ScrollReveal } from "../components/ScrollReveal";

export const Blog: React.FC = () => {
  return (
    <Layout>
      <SEO
        title="Notícias e Artigos"
        description="Fique por dentro das novidades jurídicas e institucionais do Elilon Lopes Advogados."
      />
      <Hero
        title="Notícias e Insights"
        subtitle="Blog"
        image="/images/blog.jpg"
        height="small"
      />

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {BLOG_POSTS.map((post, index) => (
              <ScrollReveal
                animation="fade-in-up"
                delay={`delay-${Math.min((index % 3) * 100 + 100, 500)}` as any}
                key={post.id}
              >
                <article
                  key={post.id}
                  className="flex flex-col h-full bg-white shadow-sm hover:shadow-xl transition-shadow duration-300"
                >
                  <Link
                    to={`/blog/${post.slug}`}
                    className="h-60 overflow-hidden relative group"
                  >
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4 bg-accent-600 text-white text-xs font-bold uppercase px-3 py-1">
                      {post.category}
                    </div>
                  </Link>
                  <div className="p-8 flex flex-col flex-grow">
                    <span className="text-sm text-neutral-400 mb-2">
                      {post.date}
                    </span>
                    <h3 className="text-2xl font-headline font-bold mb-3 hover:text-accent-600 transition-colors">
                      <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p className="text-neutral-600 mb-6 flex-grow">
                      {post.summary}
                    </p>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="text-accent-600 font-bold uppercase text-xs tracking-wider hover:text-neutral-900 transition-colors"
                    >
                      Ler artigo completo
                    </Link>
                  </div>
                </article>
              </ScrollReveal>
            ))}

            {/* Pagination Placeholder */}
            <div className="col-span-full flex justify-center space-x-2 mt-12">
              <button className="w-10 h-10 flex items-center justify-center bg-neutral-900 text-white font-bold">
                1
              </button>
              <button className="w-10 h-10 flex items-center justify-center bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100">
                2
              </button>
              <button className="w-10 h-10 flex items-center justify-center bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100">
                3
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Block */}
      <section className="py-20 bg-neutral-100">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h3 className="text-3xl font-headline mb-4">
            Assine nossa Newsletter
          </h3>
          <p className="text-neutral-600 mb-8">
            Receba análises jurídicas exclusivas diretamente em seu e-mail.
          </p>
          <div className="flex gap-4">
            <input
              type="email"
              placeholder="Seu melhor e-mail"
              className="flex-1 px-4 py-3 bg-white border border-neutral-300 focus:outline-none focus:border-accent-500"
            />
            <button className="bg-neutral-900 text-white px-8 py-3 uppercase font-bold text-sm hover:bg-accent-600 transition-colors">
              Cadastrar
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
};
