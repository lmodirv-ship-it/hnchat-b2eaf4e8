import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArticleEditor } from "@/components/blog/ArticleEditor";
import { useArticleById } from "@/hooks/useBlog";
import { useEffect } from "react";

type SearchParams = { id?: string };

export const Route = createFileRoute("/_authenticated/blog-editor")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  component: BlogEditorPage,
});

function BlogEditorPage() {
  const { id } = Route.useSearch();
  const { data: article, isLoading } = useArticleById(id ?? "");

  // Hide sidebar and footer in focus mode
  useEffect(() => {
    document.body.classList.add("blog-editor-focus");
    return () => document.body.classList.remove("blog-editor-focus");
  }, []);

  if (id && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 border-2 border-cyan-glow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <ArticleEditor article={article} />;
}
