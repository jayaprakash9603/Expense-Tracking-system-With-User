import { Link } from "react-router-dom";
import PublicLayout from "../components/PublicLayout";

export default function AboutPage() {
  return (
    <PublicLayout>
      <article className="mx-auto max-w-3xl px-4 py-12">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
          <Link to="/" className="hover:text-slate-900">
            Home
          </Link>
          <span aria-hidden="true"> / </span>
          <span>About</span>
        </nav>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">About Expensio Finance</h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-700">
          Expensio Finance exists because most money apps optimize for a first
          impression, not a third week. We built a tracker that treats logging,
          sharing, bills, and reports as one practice.
        </p>
        <section className="mt-10">
          <h2 className="text-2xl font-semibold">What we believe</h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            A useful expense app is closer to a notebook than to a social
            network. The record should be fast to add, possible to correct, and
            easy to review. Shared money should not live in a different universe
            from personal money. A bill without a due date is only a category
            with anxiety attached.
          </p>
          <p className="mt-4 leading-relaxed text-slate-700">
            We also believe public pages should contain the actual method. If
            the only indexable document is a login card, people and crawlers
            correctly conclude there is nothing here. That is why this site
            publishes guides, feature explanations, help, and policies in HTML
            anyone can read without an account.
          </p>
        </section>
        <section className="mt-10">
          <h2 className="text-2xl font-semibold">How the product is used</h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            A typical week is small: log the next purchase, keep bills on a
            calendar, and spend ten minutes reviewing one report. Couples and
            roommates use friend or group records so a shared dinner is not a
            screenshot thread. Solo users use categories and budgets to see
            whether a month drifted, then change one thing.
          </p>
          <p className="mt-4 leading-relaxed text-slate-700">
            The public{" "}
            <Link className="font-medium text-teal-800 underline" to="/guides">
              guides
            </Link>{" "}
            describe that practice in full. They are not login-gated captions.
            If you want the feature list first, start with{" "}
            <Link className="font-medium text-teal-800 underline" to="/features">
              what Expensio tracks
            </Link>
            .
          </p>
        </section>
        <section className="mt-10">
          <h2 className="text-2xl font-semibold">What we do not pretend to be</h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            We are not your bank, tax advisor, or investment manager. We do not
            sell your expense list. We cannot make a budget work if the rent is
            larger than the income. The product will show you the month; you
            still decide the next change.
          </p>
        </section>
        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Talk to us</h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            Product questions go to{" "}
            <Link className="font-medium text-teal-800 underline" to="/help">
              help
            </Link>{" "}
            or{" "}
            <Link className="font-medium text-teal-800 underline" to="/contact">
              contact
            </Link>
            . Legal and privacy details are on their own pages so they can be
            indexed and bookmarked.
          </p>
        </section>
      </article>
    </PublicLayout>
  );
}
