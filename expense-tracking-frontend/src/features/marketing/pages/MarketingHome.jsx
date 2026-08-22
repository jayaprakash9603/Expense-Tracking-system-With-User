import { Link } from "react-router-dom";
import PublicLayout from "../components/PublicLayout";
import { GUIDES } from "../content/guides";

export default function MarketingHome() {
  return (
    <PublicLayout>
      <article className="mx-auto max-w-5xl px-4 py-12">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
            Expense tracker
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
            Know where the money went, without a spreadsheet you abandon
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-700">
            Expensio Finance is a personal and household expense tracker for
            daily spending, monthly budgets, recurring bills, and shared costs.
            It is built for people who want a record they can keep on a weekday,
            not a perfect system they rebuild every January.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="rounded-md bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
            >
              Create a free account
            </Link>
            <Link
              to="/features"
              className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
            >
              See what it tracks
            </Link>
          </div>
        </header>

        <section className="mt-14 max-w-3xl" aria-labelledby="problem-heading">
          <h2 id="problem-heading" className="text-2xl font-semibold">
            The usual expense app fails in the first week
          </h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            People do not quit because they hate numbers. They quit because the
            first session asks them to reconstruct a month of receipts, invent
            twenty categories, and stare at a dashboard that cannot explain a
            roommate dinner. By Friday the app is another icon they feel guilty
            about.
          </p>
          <p className="mt-4 leading-relaxed text-slate-700">
            Expensio starts at the next purchase. Amount, category, date. Shared
            costs sit next to personal ones. Bills have due dates, not only
            labels. Reports exist to answer one question at a time: what repeated,
            what is due, and what changed since last month.
          </p>
        </section>

        <section className="mt-14" aria-labelledby="how-heading">
          <h2 id="how-heading" className="text-2xl font-semibold">
            How a week with Expensio should feel
          </h2>
          <ol className="mt-6 grid gap-6 md:grid-cols-3">
            <li className="rounded-lg border border-slate-200 bg-white p-5">
              <h3 className="font-semibold">1. Log the next spend</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                When money leaves, add it. If you paid for a group, record the
                split the same day. Do not wait for a Sunday reconstruction.
              </p>
            </li>
            <li className="rounded-lg border border-slate-200 bg-white p-5">
              <h3 className="font-semibold">2. Keep bills on a calendar</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Rent, utilities, and subscriptions need a date. Autopay still
                belongs on the calendar so the amount is visible before it
                clears.
              </p>
            </li>
            <li className="rounded-lg border border-slate-200 bg-white p-5">
              <h3 className="font-semibold">3. Review once, change one thing</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Ten minutes a week is enough. Find a repeat, move a budget, or
                close a shared balance. Then leave the dashboard alone.
              </p>
            </li>
          </ol>
        </section>

        <section className="mt-14 max-w-3xl" aria-labelledby="who-heading">
          <h2 id="who-heading" className="text-2xl font-semibold">
            Who it is for
          </h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            Solo users who want a cleaner month than their bank app provides.
            Couples and roommates who are tired of screenshot accounting.
            Anyone who has a budget they cannot see while they spend. It is not
            a brokerage, a tax filer, or a bank. It will not invest your money
            or scrape every card in the background unless you enter the record
            yourself or import what you choose to add.
          </p>
          <p className="mt-4 leading-relaxed text-slate-700">
            That manual honesty is a feature. Automatic feeds miss cash, split
            bills, and the friend who paid the restaurant. A record you typed
            while the receipt was still on the table stays closer to life.
          </p>
        </section>

        <section className="mt-14" aria-labelledby="guides-heading">
          <h2 id="guides-heading" className="text-2xl font-semibold">
            Guides worth reading before you create an account
          </h2>
          <p className="mt-3 max-w-3xl text-slate-700">
            These pages are public on purpose. Google and readers should see the
            method, not only a login form. Each guide is a complete practice you
            can use with or without the app.
          </p>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {GUIDES.map((guide) => (
              <li key={guide.slug}>
                <Link
                  to={`/guides/${guide.slug}`}
                  className="block rounded-lg border border-slate-200 bg-white p-5 hover:border-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                >
                  <h3 className="font-semibold text-slate-900">{guide.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">
                    {guide.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14 max-w-3xl" aria-labelledby="trust-heading">
          <h2 id="trust-heading" className="text-2xl font-semibold">
            Privacy, accounts, and what we do not do
          </h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            Your expenses, budgets, and bills are account data. We do not sell
            them to advertisers. Share links and friend features are explicit:
            you choose who sees a record. Read the{" "}
            <Link className="font-medium text-teal-800 underline" to="/privacy">
              privacy policy
            </Link>{" "}
            and{" "}
            <Link className="font-medium text-teal-800 underline" to="/terms">
              terms
            </Link>{" "}
            before you store anything sensitive. For product questions, use{" "}
            <Link className="font-medium text-teal-800 underline" to="/help">
              help
            </Link>{" "}
            or{" "}
            <Link className="font-medium text-teal-800 underline" to="/contact">
              contact
            </Link>
            .
          </p>
        </section>
      </article>
    </PublicLayout>
  );
}
