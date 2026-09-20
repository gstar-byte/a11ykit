import type { Metadata } from "next";
import Link from "next/link";
import {
  ExternalLink,
  CheckCircle2,
  Compass,
  ArrowRight,
  BookOpen,
  Wrench,
  Globe2,
} from "lucide-react";
import { projects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Featured Projects & Digital Ecosystem — A11yKit Network",
  description:
    "Explore our curated network of digital engineering toolkits, CAD productivity platforms, and philosophical heritage archives built for developers, designers, and thinkers.",
  alternates: { canonical: "https://a11ykit.site/projects" },
  openGraph: {
    title: "Featured Projects & Digital Ecosystem — A11yKit Network",
    description:
      "Explore our curated network of digital engineering toolkits, CAD productivity platforms, and philosophical heritage archives.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "A11yKit Projects & Ecosystem" }],
  },
};

export default function ProjectsPage() {
  const cadProjects = projects.filter((p) => p.category === "cad");
  const philosophyProjects = projects.filter((p) => p.category === "philosophy");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "CollectionPage",
                "@id": "https://a11ykit.site/projects/#webpage",
                "url": "https://a11ykit.site/projects",
                "name": "Featured Projects & Digital Ecosystem",
                "description":
                  "Explore our curated network of digital engineering toolkits, CAD productivity platforms, and philosophical heritage archives.",
                "isPartOf": { "@id": "https://a11ykit.site/#website" },
                "inLanguage": "en",
              },
              {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://a11ykit.site" },
                  { "@type": "ListItem", "position": 2, "name": "Projects", "item": "https://a11ykit.site/projects" },
                ],
              },
              {
                "@type": "ItemList",
                "name": "Digital Ecosystem Projects",
                "itemListElement": projects.map((p, index) => ({
                  "@type": "ListItem",
                  "position": index + 1,
                  "name": p.title,
                  "url": p.url,
                  "description": p.description,
                })),
              },
            ],
          }),
        }}
      />

      <div className="bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal-100/80 px-3.5 py-1 text-xs font-semibold text-teal-800 ring-1 ring-inset ring-teal-600/20">
              <Globe2 className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />
              Digital Ecosystem & Creator Portfolio
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Featured Projects & Ecosystem
            </h1>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
              Beyond accessibility standards at A11yKit, we build purposeful digital experiences
              spanning professional engineering workflows, CAD design automation, and deep
              philosophical wisdom archives.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Section 1: Engineering & CAD Tools */}
        <section aria-labelledby="cad-tools-heading" className="mb-20">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-8">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Wrench className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="cad-tools-heading" className="text-2xl font-bold text-slate-900">
                Engineering & CAD Productivity
              </h2>
              <p className="text-sm text-slate-500">
                High-performance toolkits, command references, and interactive learning platforms for drafters and engineers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {cadProjects.map((project) => (
              <article
                key={project.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-7 sm:p-8 shadow-sm transition hover:shadow-md hover:border-teal-300"
              >
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {project.categoryLabel}
                    </span>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener"
                      className="text-xs font-medium text-teal-700 hover:text-teal-800 inline-flex items-center gap-1 group/link"
                    >
                      <span>Visit Site</span>
                      <ExternalLink className="h-3.5 w-3.5 transition group-hover/link:translate-x-0.5" aria-hidden="true" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    <a href={project.url} target="_blank" rel="noopener">
                      {project.title}
                    </a>
                  </h3>

                  <p className="mt-1 text-sm font-medium text-teal-700">
                    {project.tagline}
                  </p>

                  <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="mt-6 border-t border-slate-100 pt-5">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
                      Key Highlights
                    </h4>
                    <ul className="space-y-2.5">
                      {project.highlights.map((highlight, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600">
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600 mt-0.5" aria-hidden="true" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 border-t border-slate-100 pt-5">
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-50 border border-slate-200 px-2.5 py-0.5 text-xs text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                  >
                    <span>Visit {project.shortTitle}</span>
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Section 2: Wisdom, Philosophy & Digital Archives */}
        <section aria-labelledby="philosophy-tools-heading" className="mb-16">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-8">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="philosophy-tools-heading" className="text-2xl font-bold text-slate-900">
                Wisdom, Philosophy & Digital Heritage
              </h2>
              <p className="text-sm text-slate-500">
                Digital humanities archives preserving timeless eastern non-dual philosophy and contemplative wisdom.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {philosophyProjects.map((project) => (
              <article
                key={project.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-7 sm:p-8 shadow-sm transition hover:shadow-md hover:border-teal-300"
              >
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {project.categoryLabel}
                    </span>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener"
                      className="text-xs font-medium text-teal-700 hover:text-teal-800 inline-flex items-center gap-1 group/link"
                    >
                      <span>Visit Site</span>
                      <ExternalLink className="h-3.5 w-3.5 transition group-hover/link:translate-x-0.5" aria-hidden="true" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    <a href={project.url} target="_blank" rel="noopener">
                      {project.title}
                    </a>
                  </h3>

                  <p className="mt-1 text-sm font-medium text-teal-700">
                    {project.tagline}
                  </p>

                  <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="mt-6 border-t border-slate-100 pt-5">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
                      Key Highlights
                    </h4>
                    <ul className="space-y-2.5">
                      {project.highlights.map((highlight, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600">
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600 mt-0.5" aria-hidden="true" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 border-t border-slate-100 pt-5">
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-50 border border-slate-200 px-2.5 py-0.5 text-xs text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                  >
                    <span>Visit {project.shortTitle}</span>
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Cross-Link Back to A11yKit Tools */}
        <div className="rounded-2xl bg-teal-900 p-8 sm:p-10 text-white relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-800/80 px-3 py-1 text-xs font-semibold text-teal-200 ring-1 ring-inset ring-teal-700 mb-4">
              <Compass className="h-3.5 w-3.5 text-teal-300" aria-hidden="true" />
              Built with Passion for Digital Excellence
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Explore Our Accessibility Suite
            </h2>
            <p className="mt-3 text-sm sm:text-base text-teal-100/90 leading-relaxed">
              Every project in our ecosystem is designed with strict adherence to universal web standards, privacy, and digital accessibility. Check your own web projects against WCAG 2.2 using our free, client-side tools.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-teal-900 shadow-sm transition hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Browse All A11y Tools
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-lg bg-teal-800/80 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-inset ring-teal-700 transition hover:bg-teal-800"
              >
                Learn About Our Mission
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
