import React, { useEffect, useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { SEO } from "../components/SEO";
import { ChevronLeft, Calendar, User, Share2 } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
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
  author_id?: number;
}

export const BlogPostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Scroll to top when mounting
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`${API_URL}/posts`);
        const data = await res.json();
        const posts = Array.isArray(data) ? data : [];

        const foundPost = posts.find((p: BlogPost) => p.slug === slug);

        if (foundPost) {
          setPost(foundPost);
          setRelatedPosts(
            posts.filter((p: BlogPost) => p.id !== foundPost.id).slice(0, 3),
          );
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Error loading post:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">Carregando artigo...</div>
        </div>
      </Layout>
    );
  }

  if (notFound || !post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <Layout>
      <SEO
        title={post.title}
        description={post.excerpt}
        image={post.image}
        schema={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          image: [post.image],
          datePublished: post.created_at,
          description: post.excerpt,
          author: {
            "@type": "Organization",
            name: "Elilon Lopes Advogados",
            url: "https://elilonlopesadvogados.com.br",
          },
        }}
      />
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px]">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover grayscale brightness-50"
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center px-4">
          <span className="bg-accent-600 text-white text-xs font-bold uppercase px-4 py-1 mb-6 tracking-widest rounded-sm">
            {post.category}
          </span>
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-white max-w-4xl leading-tight mb-8">
            {post.title}
          </h1>
          <div className="flex items-center space-x-6 text-neutral-300 text-sm font-medium">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-accent-500" />
              <span>
                {new Date(post.created_at).toLocaleDateString("pt-BR")}
              </span>
            </div>
            {post.author_id && (
              <div className="flex items-center gap-2">
                <User size={16} className="text-accent-500" />
                <span>Elilon Lopes Advogados</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <main className="lg:w-2/3">
            <Link
              to="/blog"
              className="inline-flex items-center text-neutral-500 hover:text-accent-600 mb-8 transition-colors text-sm font-semibold uppercase tracking-wide"
            >
              <ChevronLeft size={16} className="mr-1" />
              Voltar para o blog
            </Link>

            <article className="prose prose-lg max-w-none prose-headings:font-headline prose-headings:font-bold prose-headings:text-neutral-900 prose-p:text-neutral-600 prose-li:text-neutral-600 prose-a:text-accent-600 hover:prose-a:text-accent-500">
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(post.content || ""),
                }}
              />
            </article>

            {/* Share Section */}
            <div className="mt-12 pt-8 border-t border-neutral-200 flex items-center justify-between">
              <span className="font-bold text-neutral-900">
                Compartilhar artigo:
              </span>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    const shareData = {
                      title: post.title,
                      text: post.summary,
                      url: window.location.href,
                    };
                    if (navigator.share) {
                      navigator.share(shareData).catch(console.error);
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Link copiado para a área de transferência!");
                    }
                  }}
                  className="p-2 bg-neutral-100 rounded-full hover:bg-accent-100 text-neutral-600 hover:text-accent-600 transition-colors"
                  title="Compartilhar"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="lg:w-1/3 space-y-12">
            {/* Newsletter Widget */}
            <div className="bg-neutral-900 text-white p-8 rounded-sm text-center">
              <h3 className="font-headline text-xl font-bold mb-4 text-accent-500">
                Newsletter
              </h3>
              <p className="text-sm text-neutral-400 mb-6">
                Receba conteúdos exclusivos como este diretamente no seu e-mail.
              </p>
              <input
                type="email"
                placeholder="Seu e-mail"
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 mb-4 focus:outline-none focus:border-accent-500 text-sm"
              />
              <button className="w-full bg-accent-600 hover:bg-accent-500 text-white font-bold uppercase text-xs tracking-widest py-3 transition-colors">
                Inscrever-se
              </button>
            </div>

            {/* Read More */}
            <div>
              <h3 className="font-headline text-xl font-bold mb-6 border-b-2 border-accent-200 pb-2 inline-block">
                Leia Também
              </h3>
              <div className="space-y-6">
                {relatedPosts.map((related) => (
                  <div
                    key={related.id}
                    className="flex gap-4 group cursor-pointer"
                  >
                    <div className="w-24 h-24 flex-shrink-0 overflow-hidden">
                      <img
                        src={related.image}
                        alt={related.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-accent-600 font-bold uppercase mb-1 block">
                        {related.category}
                      </span>
                      <h4 className="font-headline font-bold text-neutral-900 leading-tight group-hover:text-accent-600 transition-colors">
                        <Link to={`/blog/${related.slug}`}>
                          {related.title}
                        </Link>
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
};
