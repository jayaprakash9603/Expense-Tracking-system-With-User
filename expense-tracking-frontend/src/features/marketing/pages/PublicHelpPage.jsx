import { Link } from "react-router-dom";
import PublicLayout from "../components/PublicLayout";
import { FAQ_CATEGORIES } from "../../help-support/content/faqCategories";

export default function PublicHelpPage() {
  return (
    <PublicLayout>
      <article className="mx-auto max-w-3xl px-4 py-12">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
          <Link to="/" className="hover:text-slate-900">
            Home
          </Link>
          <span aria-hidden="true"> / </span>
          <span>Help</span>
        </nav>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">Help Center</h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-700">
          Common questions about using Expensio Finance. These answers are on a
          public page so you can read them before you sign in. If you need a
          person, use the{" "}
          <Link className="font-medium text-teal-800 underline" to="/contact">
            contact page
          </Link>
          .
        </p>
        {FAQ_CATEGORIES.map((category) => (
          <section key={category.id} className="mt-10" aria-labelledby={category.id}>
            <h2 id={category.id} className="text-2xl font-semibold">
              {category.title}
            </h2>
            <dl className="mt-4 space-y-5">
              {category.faqs.map((faq) => (
                <div key={faq.question}>
                  <dt className="font-semibold text-slate-900">{faq.question}</dt>
                  <dd className="mt-1 leading-relaxed text-slate-700">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </article>
    </PublicLayout>
  );
}
