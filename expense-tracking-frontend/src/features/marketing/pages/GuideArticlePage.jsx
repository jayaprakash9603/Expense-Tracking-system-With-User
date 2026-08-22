import { Link, Navigate, useParams } from "react-router-dom";
import PublicLayout from "../components/PublicLayout";
import { getGuideBySlug, GUIDES } from "../content/guides";

export default function GuideArticlePage() {
  const { slug } = useParams();
  const guide = getGuideBySlug(slug);

  if (!guide) {
    return <Navigate to="/guides" replace />;
  }

  const related = GUIDES.filter((item) => item.slug !== guide.slug).slice(0, 3);

  return (
    <PublicLayout>
      <article className="mx-auto max-w-3xl px-4 py-12">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
          <Link to="/" className="hover:text-slate-900">
            Home
          </Link>
          <span aria-hidden="true"> / </span>
          <Link to="/guides" className="hover:text-slate-900">
            Guides
          </Link>
          <span aria-hidden="true"> / </span>
          <span>{guide.title}</span>
        </nav>
        <header className="mt-4">
          <p className="text-sm text-slate-500">
            Updated {guide.dateModified} · {guide.minutes} min read
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">{guide.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-700">
            {guide.description}
          </p>
        </header>
        {guide.sections.map((section) => (
          <section key={section.heading} className="mt-10">
            <h2 className="text-2xl font-semibold">{section.heading}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className="mt-4 leading-relaxed text-slate-700">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
        <aside className="mt-12 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Keep going</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            {related.map((item) => (
              <li key={item.slug}>
                <Link className="text-teal-800 underline" to={`/guides/${item.slug}`}>
                  {item.title}
                </Link>
              </li>
            ))}
            <li>
              <Link className="text-teal-800 underline" to="/features">
                Product features
              </Link>
            </li>
            <li>
              <Link className="text-teal-800 underline" to="/register">
                Create an Expensio account
              </Link>
            </li>
          </ul>
        </aside>
      </article>
    </PublicLayout>
  );
}
