import { Link } from "react-router-dom";
import PublicLayout from "../components/PublicLayout";
import { GUIDES } from "../content/guides";

export default function GuidesIndexPage() {
  return (
    <PublicLayout>
      <article className="mx-auto max-w-3xl px-4 py-12">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
          <Link to="/" className="hover:text-slate-900">
            Home
          </Link>
          <span aria-hidden="true"> / </span>
          <span>Guides</span>
        </nav>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">
          Personal finance guides
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-700">
          These articles are written as complete public pages, not as captions
          under a screenshot. They exist so search engines and AdSense see the
          same useful explanations a person would send a roommate. Use them with
          Expensio Finance or with a notebook. The method matters more than the
          brand.
        </p>
        <ul className="mt-8 space-y-5">
          {GUIDES.map((guide) => (
            <li key={guide.slug} className="rounded-lg border border-slate-200 bg-white p-5">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {guide.minutes} min read
              </p>
              <h2 className="mt-1 text-xl font-semibold">
                <Link
                  to={`/guides/${guide.slug}`}
                  className="hover:text-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                >
                  {guide.title}
                </Link>
              </h2>
              <p className="mt-2 leading-relaxed text-slate-700">{guide.description}</p>
            </li>
          ))}
        </ul>
      </article>
    </PublicLayout>
  );
}
