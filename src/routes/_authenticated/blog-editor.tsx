import { createFileRoute } from "@tanstack/react-router";
import { ArticleEditor } from "@/components/blog/ArticleEditor";
import { useArticleById } from "@/hooks/useBlog";
import { PageShell } from "@/components/PageShell";

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

  if (id && isLoading) {
    return (
      <PageShell title="تحميل...">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 border-2 border-cyan-glow border-t-transparent rounded-full animate-spin" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title={id ? "تعديل المقال" : "إنشاء مقال جديد"}>
      <ArticleEditor article={article} />
    </PageShell>
  );
}
