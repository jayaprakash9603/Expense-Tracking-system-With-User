import { Link } from "react-router-dom";
import PublicLayout from "../components/PublicLayout";
import { PRIVACY_SECTIONS, TERMS_SECTIONS } from "../content/legal";

export default function LegalPage({ variant }) {
  const isPrivacy = variant === "privacy";
  const title = isPrivacy ? "Privacy Policy" : "Terms of Service";
  const sections = isPrivacy ? PRIVACY_SECTIONS : TERMS_SECTIONS;
  const updated = "August 18, 2026";

  return (
    <PublicLayout>
      <article className="mx-auto max-w-3xl px-4 py-12">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
          <Link to="/" className="hover:text-slate-900">
            Home
          </Link>
          <span aria-hidden="true"> / </span>
          <span>{title}</span>
        </nav>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated {updated}</p>
        <p className="mt-4 leading-relaxed text-slate-700">
          This page is public so you can read it before creating an account. The
          in-app copy under Support matches the same commitments.
        </p>
        {sections.map((section) => (
          <section key={section.id} className="mt-8" aria-labelledby={section.id}>
            <h2 id={section.id} className="text-2xl font-semibold">
              {section.title}
            </h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-700">
              {section.content}
            </p>
          </section>
        ))}
        <p className="mt-10 text-sm text-slate-600">
          Related:{" "}
          <Link className="text-teal-800 underline" to={isPrivacy ? "/terms" : "/privacy"}>
            {isPrivacy ? "Terms of Service" : "Privacy Policy"}
          </Link>
          {" · "}
          <Link className="text-teal-800 underline" to="/contact">
            Contact
          </Link>
        </p>
      </article>
    </PublicLayout>
  );
}
