import React, { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Hero } from "../components/Components";
import { Link } from "react-router-dom";
import { SEO } from "../components/SEO";
import { ScrollReveal } from "../components/ScrollReveal";
import { getApiBaseUrl } from "../utils/api";

const API_URL = getApiBaseUrl();

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  category: string;
  image: string;
  excerpt: string;
  content: string;
  created_at: string;
}

export const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${API_URL}/posts`);
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error loading posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(posts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = posts.slice(startIndex, endIndex);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">Carregando artigos...</div>
        </div>
      </Layout>
    );
  }

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
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-12">
            {currentPosts.map((post, index) => (
              <ScrollReveal
                animation="fade-in-up"
                delay={`delay-${Math.min((index % 3) * 100 + 100, 500)}` as any}
                key={post.id}
              >
                <article className="flex flex-col h-full bg-white shadow-sm hover:shadow-xl transition-shadow duration-300">
                  <Link
                    to={`/blog/${post.slug}`}
                    className="h-32 sm:h-40 md:h-60 overflow-hidden relative group"
                  >
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-accent-600 text-white text-[10px] md:text-xs font-bold uppercase px-2 py-0.5 md:px-3 md:py-1">
                      {post.category}
                    </div>
                  </Link>
                  <div className="p-3 sm:p-5 md:p-8 flex flex-col flex-grow">
                    <span className="text-[10px] sm:text-sm text-neutral-400 mb-1 md:mb-2">
                      {new Date(post.created_at).toLocaleDateString("pt-BR")}
                    </span>
                    <h3 className="text-sm sm:text-lg md:text-2xl font-headline font-bold mb-2 md:mb-3 hover:text-accent-600 transition-colors line-clamp-2">
                      <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p className="text-neutral-600 text-xs sm:text-sm md:text-base mb-3 md:mb-6 flex-grow line-clamp-3 md:line-clamp-none">
                      {post.excerpt}
                    </p>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="text-accent-600 font-bold uppercase text-[10px] sm:text-xs tracking-wider hover:text-neutral-900 transition-colors"
                    >
                      Ler artigo
                    </Link>
                  </div>
                </article>
              </ScrollReveal>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="col-span-full flex justify-center space-x-2 mt-12">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`w-10 h-10 flex items-center justify-center font-bold transition-colors ${
                        currentPage === page
                          ? "bg-neutral-900 text-white"
                          : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>
            )}
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
