import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { tools, getToolBySlug } from "@/lib/tools";
import { ContrastChecker } from "@/components/tools/contrast-checker";
import { WcagChecklist } from "@/components/tools/wcag-checklist";
import { StatementGenerator } from "@/components/tools/statement-generator";

export function generateStaticParams() {
  return tools
    .filter((t) => t.status === "live")
    .map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};

  return {
    title: `${tool.title} — A11yKit`,
    description: tool.description,
    alternates: { canonical: `https://a11ykit.site/tools/${tool.slug}` },
    openGraph: {
      title: `${tool.title} — A11yKit`,
      description: tool.description,
    },
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool || tool.status !== "live") notFound();

  const Icon = tool.icon;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-slate-500">
          <li>
            <a href="/" className="hover:text-teal-600">Home</a>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <a href="/tools" className="hover:text-teal-600">Tools</a>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-slate-900 font-medium">
            {tool.shortTitle}
          </li>
        </ol>
      </nav>

      <header className="mb-8 flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {tool.title}
          </h1>
          <p className="mt-2 text-slate-600">{tool.longDescription}</p>
        </div>
      </header>

      {slug === "contrast-checker" && <ContrastChecker />}
      {slug === "wcag-checklist" && <WcagChecklist />}
      {slug === "accessibility-statement" && <StatementGenerator />}
    </div>
  );
}
