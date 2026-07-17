import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { tools, getToolBySlug } from "@/lib/tools";
import { ContrastChecker } from "@/components/tools/contrast-checker";
import { WcagChecklist } from "@/components/tools/wcag-checklist";
import { StatementGenerator } from "@/components/tools/statement-generator";
import { AriaGenerator } from "@/components/tools/aria-generator";
import { HeadingAnalyzer } from "@/components/tools/heading-analyzer";
import { FormLabelChecker } from "@/components/tools/form-label-checker";
import { ColorBlindSimulator } from "@/components/tools/color-blind-simulator";
import { HtmlScanner } from "@/components/tools/html-scanner";
import { LinkTextChecker } from "@/components/tools/link-text-checker";
import { FocusOrderChecker } from "@/components/tools/focus-order-checker";
import { AltTextChecker } from "@/components/tools/alt-text-checker";

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
    description: tool.longDescription,
    alternates: { canonical: `https://a11ykit.site/tools/${tool.slug}` },
    openGraph: {
      title: `${tool.title} — A11yKit`,
      description: tool.longDescription,
      images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: tool.title }],
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
    <>
      {/* SoftwareApplication 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": tool.title,
            "description": tool.longDescription,
            "url": `https://a11ykit.site/tools/${tool.slug}`,
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "All",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })
        }}
      />

      {/* BreadcrumbList 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://a11ykit.site" },
              { "@type": "ListItem", "position": 2, "name": "Tools", "item": "https://a11ykit.site/tools" },
              { "@type": "ListItem", "position": 3, "name": tool.shortTitle }
            ]
          })
        }}
      />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-slate-600">
            <li>
              <Link href="/" className="hover:text-teal-700">Home</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/tools" className="hover:text-teal-700">Tools</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-slate-900 font-medium">
              {tool.shortTitle}
            </li>
          </ol>
        </nav>

        <header className="mb-8 flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
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
        {slug === "aria-generator" && <AriaGenerator />}
        {slug === "heading-analyzer" && <HeadingAnalyzer />}
        {slug === "form-label-checker" && <FormLabelChecker />}
        {slug === "color-blind-simulator" && <ColorBlindSimulator />}
        {slug === "html-scanner" && <HtmlScanner />}
        {slug === "link-text-checker" && <LinkTextChecker />}
        {slug === "focus-order-checker" && <FocusOrderChecker />}
        {slug === "alt-text-checker" && <AltTextChecker />}
      </div>
    </>
  );
}
