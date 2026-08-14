import { notFound } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { tools, getToolBySlug } from "@/lib/tools";
import { ToolContent } from "@/components/tool-content";

// 统一骨架屏：避免动态载入时产生 CLS（累积布局偏移）
function ToolSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm animate-pulse space-y-4">
      <div className="h-6 w-1/3 rounded bg-slate-200" />
      <div className="h-24 rounded bg-slate-100" />
      <div className="h-10 w-1/4 rounded bg-slate-200" />
    </div>
  );
}

// 路由级动态按需加载：各工具拥有独立 Chunk，杜绝无用 JS 打包
const ContrastChecker = dynamic(
  () => import("@/components/tools/contrast-checker").then((m) => m.ContrastChecker),
  { loading: ToolSkeleton }
);
const WcagChecklist = dynamic(
  () => import("@/components/tools/wcag-checklist").then((m) => m.WcagChecklist),
  { loading: ToolSkeleton }
);
const StatementGenerator = dynamic(
  () => import("@/components/tools/statement-generator").then((m) => m.StatementGenerator),
  { loading: ToolSkeleton }
);
const AriaGenerator = dynamic(
  () => import("@/components/tools/aria-generator").then((m) => m.AriaGenerator),
  { loading: ToolSkeleton }
);
const HeadingAnalyzer = dynamic(
  () => import("@/components/tools/heading-analyzer").then((m) => m.HeadingAnalyzer),
  { loading: ToolSkeleton }
);
const FormLabelChecker = dynamic(
  () => import("@/components/tools/form-label-checker").then((m) => m.FormLabelChecker),
  { loading: ToolSkeleton }
);
const ColorBlindSimulator = dynamic(
  () => import("@/components/tools/color-blind-simulator").then((m) => m.ColorBlindSimulator),
  { loading: ToolSkeleton }
);
const HtmlScanner = dynamic(
  () => import("@/components/tools/html-scanner").then((m) => m.HtmlScanner),
  { loading: ToolSkeleton }
);
const LinkTextChecker = dynamic(
  () => import("@/components/tools/link-text-checker").then((m) => m.LinkTextChecker),
  { loading: ToolSkeleton }
);
const FocusOrderChecker = dynamic(
  () => import("@/components/tools/focus-order-checker").then((m) => m.FocusOrderChecker),
  { loading: ToolSkeleton }
);
const AltTextChecker = dynamic(
  () => import("@/components/tools/alt-text-checker").then((m) => m.AltTextChecker),
  { loading: ToolSkeleton }
);
const UrlScanner = dynamic(
  () => import("@/components/tools/url-scanner").then((m) => m.UrlScanner),
  { loading: ToolSkeleton }
);
const PdfChecker = dynamic(
  () => import("@/components/tools/pdf-checker").then((m) => m.PdfChecker),
  { loading: ToolSkeleton }
);
const AltTextGenerator = dynamic(
  () => import("@/components/tools/alt-text-generator").then((m) => m.AltTextGenerator),
  { loading: ToolSkeleton }
);
const AccessibilityMonitor = dynamic(
  () => import("@/components/tools/accessibility-monitor").then((m) => m.AccessibilityMonitor),
  { loading: ToolSkeleton }
);
const ReadingLevelAnalyzer = dynamic(
  () => import("@/components/tools/reading-level-analyzer").then((m) => m.ReadingLevelAnalyzer),
  { loading: ToolSkeleton }
);
const TouchTargetChecker = dynamic(
  () => import("@/components/tools/touch-target-checker").then((m) => m.TouchTargetChecker),
  { loading: ToolSkeleton }
);
const SkipLinkGenerator = dynamic(
  () => import("@/components/tools/skip-link-generator").then((m) => m.SkipLinkGenerator),
  { loading: ToolSkeleton }
);
const LandmarkVisualizer = dynamic(
  () => import("@/components/tools/landmark-visualizer").then((m) => m.LandmarkVisualizer),
  { loading: ToolSkeleton }
);
const FocusIndicatorGenerator = dynamic(
  () => import("@/components/tools/focus-indicator-generator").then((m) => m.FocusIndicatorGenerator),
  { loading: ToolSkeleton }
);
const ColorPaletteGenerator = dynamic(
  () => import("@/components/tools/color-palette-generator").then((m) => m.ColorPaletteGenerator),
  { loading: ToolSkeleton }
);
const AnimationChecker = dynamic(
  () => import("@/components/tools/animation-checker").then((m) => m.AnimationChecker),
  { loading: ToolSkeleton }
);
const ContrastBatchTester = dynamic(
  () => import("@/components/tools/contrast-batch-tester").then((m) => m.ContrastBatchTester),
  { loading: ToolSkeleton }
);
const WebcamColorblind = dynamic(
  () => import("@/components/tools/webcam-colorblind").then((m) => m.WebcamColorblind),
  { loading: ToolSkeleton }
);
const FormErrorChecker = dynamic(
  () => import("@/components/tools/form-error-checker").then((m) => m.FormErrorChecker),
  { loading: ToolSkeleton }
);
const AltQualityScorer = dynamic(
  () => import("@/components/tools/alt-quality-scorer").then((m) => m.AltQualityScorer),
  { loading: ToolSkeleton }
);
const AiAriaGenerator = dynamic(
  () => import("@/components/tools/ai-aria-generator").then((m) => m.AiAriaGenerator),
  { loading: ToolSkeleton }
);

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
    description: tool.metaDescription,
    alternates: { canonical: `https://a11ykit.site/tools/${tool.slug}` },
    openGraph: {
      title: `${tool.title} — A11yKit`,
      description: tool.metaDescription,
      type: "website",
      url: `https://a11ykit.site/tools/${tool.slug}`,
      images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: tool.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${tool.title} — A11yKit`,
      description: tool.metaDescription,
      images: ["/og-image.jpg"],
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
            "description": tool.metaDescription,
            "url": `https://a11ykit.site/tools/${tool.slug}`,
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "All",
            "browserRequirements": "Requires JavaScript. Multi-browser HTML5 compatible.",
            "featureList": [
              "100% Client-side processing",
              "WCAG 2.2 & EAA compliance checking",
              "Zero data transmission",
              "No account required"
            ],
            "dateModified": new Date().toISOString().split("T")[0],
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "creator": {
              "@id": "https://a11ykit.site/#organization"
            },
            "isPartOf": {
              "@id": "https://a11ykit.site/#webapp"
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

      {/* FAQPage 结构化数据（与页面可见 FAQ 完全同源） */}
      {tool.faq && tool.faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": tool.faq.map((item) => ({
                "@type": "Question",
                "name": item.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": item.answer
                }
              }))
            })
          }}
        />
      )}

      {/* HowTo 结构化数据（与页面可见步骤完全同源） */}
      {tool.howToUse && tool.howToUse.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "HowTo",
              "name": `How to use the ${tool.title}`,
              "description": tool.description,
              "step": tool.howToUse.map((s, i) => ({
                "@type": "HowToStep",
                "position": i + 1,
                "name": s.step,
                "text": s.description
              }))
            })
          }}
        />
      )}

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
        {slug === "url-scanner" && <UrlScanner />}
        {slug === "pdf-checker" && <PdfChecker />}
        {slug === "alt-text-generator" && <AltTextGenerator />}
        {slug === "accessibility-monitor" && <AccessibilityMonitor />}
        {slug === "reading-level-analyzer" && <ReadingLevelAnalyzer />}
        {slug === "touch-target-checker" && <TouchTargetChecker />}
        {slug === "skip-link-generator" && <SkipLinkGenerator />}
        {slug === "landmark-visualizer" && <LandmarkVisualizer />}
        {slug === "focus-indicator-generator" && <FocusIndicatorGenerator />}
        {slug === "color-palette-generator" && <ColorPaletteGenerator />}
        {slug === "animation-checker" && <AnimationChecker />}
        {slug === "contrast-batch" && <ContrastBatchTester />}
        {slug === "webcam-colorblind" && <WebcamColorblind />}
        {slug === "form-error-checker" && <FormErrorChecker />}
        {slug === "alt-quality-scorer" && <AltQualityScorer />}
        {slug === "ai-aria-generator" && <AiAriaGenerator />}

        <ToolContent tool={{ ...tool, icon: undefined }} />
      </div>
    </>
  );
}
