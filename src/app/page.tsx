import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Zap, Lock, ArrowRight } from "lucide-react";
import { tools, liveTools, categoryLabels } from "@/lib/tools";

export const metadata: Metadata = {
  title: "A11yKit — Free WCAG & EAA Accessibility Tools",
  description:
    "15 free online accessibility tools for WCAG 2.2 and EAA compliance. Contrast checker, WCAG checklist, accessibility statement generator, ARIA generator, and more. No signup, 100% client-side.",
  alternates: { canonical: "https://a11ykit.site" },
  openGraph: {
    title: "A11yKit — Free WCAG & EAA Accessibility Tools",
    description:
      "15 free online accessibility tools for WCAG 2.2 and EAA compliance. No signup, 100% client-side.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "A11yKit" }],
  },
};

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-700/[0.2]" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-teal-950/60 px-4 py-1.5 text-sm font-medium text-teal-100 ring-1 ring-inset ring-teal-400/40">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
              EAA enforced since June 2025 — are you compliant?
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Free Accessibility Tools
              <span className="block text-teal-400">for WCAG 2.2 & EAA</span>
            </h1>
            <p className="mt-6 text-lg text-slate-300 sm:text-xl">
              15 free tools to check, fix, and generate accessible web content.
              Contrast checker, WCAG checklist, accessibility statement
              generator, and more. No signup. 100% client-side.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/tools/contrast-checker"
                className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-teal-700/30 transition hover:bg-teal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
              >
                Try Contrast Checker
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-6 py-3 text-base font-semibold text-white ring-1 ring-inset ring-white/20 backdrop-blur transition hover:bg-white/20"
              >
                Browse All Tools
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features bar */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h2 className="sr-only">Why choose A11yKit</h2>
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <li className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-teal-50">
                <Zap className="h-5 w-5 text-teal-700" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Instant results</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Everything runs in your browser. No server round-trips, no waiting.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-teal-50">
                <Lock className="h-5 w-5 text-teal-700" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">100% private</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Your data never leaves your device. No tracking, no accounts.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-teal-50">
                <ShieldCheck className="h-5 w-5 text-teal-700" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">WCAG 2.2 aligned</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Tools check against the latest WCAG 2.2 and EAA requirements.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Tool grid */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              All Tools in One Place
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              The complete accessibility toolkit — from checking contrast to
              generating your compliance statement.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => {
              const Icon = tool.icon;
              const isLive = tool.status === "live";
              const cardContent = (
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-700 transition group-hover:bg-teal-100">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        {categoryLabels[tool.category]}
                      </span>
                      {isLive ? (
                        <span className="text-xs font-bold text-emerald-700">
                          ● Live
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-slate-600">
                          Coming soon
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900 group-hover:text-teal-700">
                    {tool.title}
                  </h3>
                  <p className="mt-2 flex-grow text-sm text-slate-600">
                    {tool.description}
                  </p>
                  {isLive && (
                    <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-700">
                      Open tool
                      <ArrowRight
                        className="h-4 w-4 transition group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                </>
              );

              return isLive ? (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-teal-300"
                  aria-label={tool.title}
                >
                  {cardContent}
                </Link>
              ) : (
                <div
                  key={tool.slug}
                  className="group relative flex flex-col rounded-xl border border-slate-200 bg-slate-50/60 p-6 shadow-sm cursor-default"
                  aria-label={`${tool.title} (coming soon)`}
                >
                  {cardContent}
                </div>
              );
            })}
          </div>

          <div className="mt-12 rounded-xl bg-teal-50 p-8 text-center">
            <p className="text-lg font-medium text-slate-900">
              {liveTools.length} tools — all free, all client-side, no signup required.
            </p>
          </div>
        </div>
      </section>

      {/* EAA info section */}
      <section className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900">
            What is the European Accessibility Act?
          </h2>
          <div className="mt-6 space-y-4 text-slate-600">
            <p>
              The <strong>European Accessibility Act (EAA)</strong> — formally
              Directive (EU) 2019/882 — became enforceable across all 27 EU
              member states on June 28, 2025. It requires businesses selling
              products or services to EU consumers to ensure their websites and
              apps meet WCAG 2.1 Level AA accessibility standards.
            </p>
            <h3 className="text-lg font-semibold text-slate-900 mt-6">Penalties for non-compliance</h3>
            <p>
              Non-compliance can result in fines up to €1,000,000 (Spain), 5% of
              annual turnover (Italy), or court-ordered remediation with daily
              penalties — as seen in the 2026 Carrefour case (€500/day
              astreinte).
            </p>
            <h3 className="text-lg font-semibold text-slate-900 mt-6">Global convergence on WCAG</h3>
            <p>
              Similar laws exist or are being enacted worldwide: ADA Title II
              (US, 2027-2028), ACA (Canada), AODA (Ontario), and accessibility
              laws in Japan, South Korea, India, and Australia. All converge on
              the same technical standard: <strong>WCAG 2.1/2.2 Level AA</strong>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
