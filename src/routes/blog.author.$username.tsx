import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuthorArticles } from "@/hooks/useBlog";
import { PublicPageShell } from "@/components/layout/PublicPageShell";
import { Calendar, Eye, Clock, User, FileText } from "lucide-react";

export const Route = createFileRoute("/blog/author/$username")({
  component: AuthorPage,
});

function AuthorPage() {
  const { username } = Route.useParams();
  const { data, isLoading, error } = useAuthorArticles(username);

  if (isLoading) {
    return (
      <PublicPageShell dir="ltr">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="h-32 bg-ice-card/10 animate-pulse rounded-2xl mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2].map((i) => <div key={i} className="h-64 bg-ice-card/10 animate-pulse rounded-2xl" />)}
          </div>
        </div>
      </PublicPageShell>
    );
  }

  if (error || !data) {
    return (
      <PublicPageShell dir="ltr">
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold mb-2">Author not found</h1>
          <Link to="/blog" className="text-cyan-glow hover:underline">← Back to Blog</Link>
        </div>
      </PublicPageShell>
    );
  }

  const { profile, articles } = data;

  return (
    <PublicPageShell dir="ltr">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Author Header */}
        <div className="flex items-center gap-5 mb-10 p-6 rounded-2xl border border-ice-border/15 bg-ice-card/5">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-20 w-20 rounded-full shrink-0" />
          ) : (
            <div className="h-20 w-20 rounded-full bg-ice-card/20 flex items-center justify-center shrink-0">
              <User className="h-8 w-8 text-muted-foreground/30" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{profile.full_name ?? profile.username}</h1>
            <p className="text-sm text-muted-foreground">@{profile.username} • {articles.length} articles</p>
            {profile.bio && <p className="text-sm text-muted-foreground/60 mt-2">{profile.bio}</p>}
          </div>
        </div>

        {/* Articles */}
        {articles.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground">No published articles yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {articles.map((article) => (
              <Link key={article.id} to="/blog/$articleId" params={{ articleId: article.short_id ?? article.id }} className="group block">
                <article className="rounded-2xl overflow-hidden border border-ice-border/15 bg-ice-card/5 hover:border-cyan-glow/30 transition-all duration-500">
                  {article.featured_image ? (
                    <img src={article.featured_image} alt={article.title} className="w-full h-40 object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-cyan-glow/10 to-violet-glow/10" />
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-sm mb-2 line-clamp-2 group-hover:text-cyan-glow transition-colors">{article.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground/50">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{article.published_at ? new Date(article.published_at).toLocaleDateString() : ""}</span>
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{article.views_count}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.reading_time} min</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PublicPageShell>
  );
}
