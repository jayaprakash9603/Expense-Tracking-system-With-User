import { Link } from "react-router-dom";
import PublicLayout from "../components/PublicLayout";
import { FEATURE_SECTIONS } from "../content/features";

export default function FeaturesPage() {
  return (
    <PublicLayout>
      <article className="mx-auto max-w-3xl px-4 py-12">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
          <Link to="/" className="hover:text-slate-900">
            Home
          </Link>
          <span aria-hidden="true"> / </span>
          <span>Features</span>
        </nav>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">
          What Expensio Finance tracks
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-700">
          The product is a connected set of records: expenses, categories,
          budgets, bills, people you share costs with, and reports that can
          finish in a short sitting. Each area below is something you can do
          after you create an account. None of it requires a plugin or a
          marketing pop-up.
        </p>
        {FEATURE_SECTIONS.map((section) => (
          <section key={section.id} className="mt-10" aria-labelledby={section.id}>
            <h2 id={section.id} className="text-2xl font-semibold">
              {section.title}
            </h2>
            {section.body.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="mt-4 leading-relaxed text-slate-700">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
        <p className="mt-12 leading-relaxed text-slate-700">
          If you want the habit first, start with the{" "}
          <Link className="font-medium text-teal-800 underline" to="/guides/how-to-track-daily-expenses">
            daily expense guide
          </Link>{" "}
          or the{" "}
          <Link className="font-medium text-teal-800 underline" to="/guides/build-a-monthly-budget">
            monthly budget guide
          </Link>
          . When you are ready,{" "}
          <Link className="font-medium text-teal-800 underline" to="/register">
            create an account
          </Link>
          .
        </p>
      </article>
    </PublicLayout>
  );
}
