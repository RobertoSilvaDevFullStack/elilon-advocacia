import { useState, useEffect } from "react";
import { getApiBaseUrl } from "../utils/api";

export interface DisplayBlogPost {
  id: number;
  title: string;
  slug: string;
  category: string;
  image: string;
  summary: string;
  date: string;
}

interface ApiBlogPost {
  id: number;
  title: string;
  slug: string;
  category: string;
  image: string;
  excerpt?: string;
  created_at: string;
}

function apiToDisplay(post: ApiBlogPost): DisplayBlogPost {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    category: post.category,
    image: post.image,
    summary: post.excerpt || "",
    date: new Date(post.created_at).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  };
}

/**
 * Busca posts só quando a seção entra no viewport —
 * evita fetch + parse de constants na carga inicial.
 */
export function useBlogPosts(enabled = true) {
  const [posts, setPosts] = useState<DisplayBlogPost[]>([]);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const fetchPosts = async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/posts`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: unknown = await res.json();
        if (cancelled) return;
        if (Array.isArray(data)) {
          setPosts(data.map((post) => apiToDisplay(post as ApiBlogPost)));
        }
      } catch (error) {
        console.error("Error loading blog posts:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPosts();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { posts, loading };
}
