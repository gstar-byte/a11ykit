import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { tools, categoryLabels, type ToolCategory } from "@/lib/tools";

export const metadata: Metadata = {
  title: "All Accessibility Tools — A11yKit",
  description:
    "Browse all 11 free WCAG and EAA accessibility tools. Contrast checker, WCAG 2.2 checklist, accessibility statement generator, ARIA generator, heading analyzer, and more.",
  alternates: { canonical: "https://a11ykit.site/tools" },
  openGraph: {
    title: "All Accessibility Tools — A11yKit",
    description:
      "Browse all 11 free WCAG and EAA accessibility tools. Contrast checker, WCAG 2.2 checklist, accessibility statement generator, ARIA generator, heading analyzer, and more.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "A11yKit Tools" }],
  },
};

const categoryOrder: ToolCategory[] = ["check", "fix", "generate", "simulate"];

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          All Accessibility Tools
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">
          11 free tools for WCAG 2.2 and EAA compliance. Everything runs in your
          browser — no signup, no tracking.
        </p>
      </div>

      {categoryOrder.map((cat) => {
        const catTools = tools.filter((t) => t.category === cat);
        if (catTools.length === 0) return null;
        return (
          <section key={cat} className="mb-12">
            <h2 className="mb-6 text-xl font-semibold text-slate-900">
              {categoryLabels[cat]} Tools
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {catTools.map((tool) => {
                const Icon = tool.icon;
                const isLive = tool.status === "live";
                const cardContent = (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-600 transition group-hover:bg-teal-100">
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      {isLive ? (
                        <span className="text-xs font-medium text-green-600">
                          ● Live
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-slate-400">
                          Coming soon
                        </span>
                      )}
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-slate-900 group-hover:text-teal-600">
                      {tool.title}
                    </h3>
                    <p className="mt-2 flex-grow text-sm text-slate-600">
                      {tool.description}
                    </p>
                    {isLive && (
                      <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-teal-600">
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
                    className="group flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-teal-300"
                  >
                    {cardContent}
                  </Link>
                ) : (
                  <div
                    key={tool.slug}
                    className="group flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm opacity-75 cursor-default"
                  >
                    {cardContent}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
