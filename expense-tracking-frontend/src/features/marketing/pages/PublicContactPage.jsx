import { Link } from "react-router-dom";
import PublicLayout from "../components/PublicLayout";

const CHANNELS = [
  {
    title: "Product support",
    email: "support@expensio.com",
    body: "Account access, missing expenses, bills, sharing links, and how a feature is supposed to work. Include the page you were on and what you expected to happen.",
  },
  {
    title: "Privacy requests",
    email: "support@expensio.com",
    body: "Access, correction, or deletion of account data. Say that the message is a privacy request so it is routed correctly.",
  },
  {
    title: "Legal",
    email: "legal@expensio.com",
    body: "Questions about the terms of service or notices. We respond within 5–7 business days when we can.",
  },
];

export default function PublicContactPage() {
  return (
    <PublicLayout>
      <article className="mx-auto max-w-3xl px-4 py-12">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
          <Link to="/" className="hover:text-slate-900">
            Home
          </Link>
          <span aria-hidden="true"> / </span>
          <span>Contact</span>
        </nav>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">Contact Expensio Finance</h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-700">
          Email is the reliable channel. We do not require an account to send a
          message. Check{" "}
          <Link className="font-medium text-teal-800 underline" to="/help">
            help
          </Link>{" "}
          first if the question is about logging expenses, budgets, or bills.
        </p>
        <div className="mt-8 space-y-5">
          {CHANNELS.map((channel) => (
            <section
              key={channel.title}
              className="rounded-lg border border-slate-200 bg-white p-5"
            >
              <h2 className="text-xl font-semibold">{channel.title}</h2>
              <p className="mt-2 leading-relaxed text-slate-700">{channel.body}</p>
              <p className="mt-3">
                <a
                  className="font-medium text-teal-800 underline"
                  href={`mailto:${channel.email}`}
                >
                  {channel.email}
                </a>
              </p>
            </section>
          ))}
        </div>
        <p className="mt-8 text-sm text-slate-600">
          Please do not send passwords, backup codes, or full card numbers.
        </p>
      </article>
    </PublicLayout>
  );
}
