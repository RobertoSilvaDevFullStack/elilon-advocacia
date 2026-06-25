import { useState, useEffect } from "react";
import { BLOG_POSTS } from "../constants";
import { getApiBaseUrl } from "../utils/api";
import type { BlogPost } from "../types";

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

const MONTHS: Record<string, number> = {
  Jan: 0,
  Fev: 1,
  Mar: 2,
  Abr: 3,
  Mai: 4,
  Jun: 5,
  Jul: 6,
  Ago: 7,
  Set: 8,
  Out: 9,
  Nov: 10,
  Dez: 11,
};

function parseStaticDate(dateStr: string): number {
  const parts = dateStr.split(" ");
  if (parts.length !== 3) return 0;
  const day = parseInt(parts[0], 10);
  const month = MONTHS[parts[1]];
  const year = parseInt(parts[2], 10);
  return new Date(year, month, day).getTime();
}

function staticToDisplay(post: BlogPost): DisplayBlogPost {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    category: post.category,
    image: post.image,
    summary: post.summary,
    date: post.date,
  };
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

function sortStaticPosts(posts: BlogPost[]): DisplayBlogPost[] {
  return [...posts]
    .sort((a, b) => parseStaticDate(b.date) - parseStaticDate(a.date))
    .map(staticToDisplay);
}

/** Posts do blog — API em produção, fallback para constants.ts se a API falhar. */
export function useBlogPosts() {
  const [posts, setPosts] = useState<DisplayBlogPost[]>(() =>
    sortStaticPosts(BLOG_POSTS),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchPosts = async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/posts`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: unknown = await res.json();
        if (cancelled) return;

        if (Array.isArray(data) && data.length > 0) {
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
  }, []);

  return { posts, loading };
}
