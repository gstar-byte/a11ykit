import Link from "next/link";
import { ChevronDown, HelpCircle, ListChecks, Lightbulb, Wrench } from "lucide-react";
import type { Tool, FAQItem, HowToStep, ToolCategory } from "@/lib/tools";
import { tools } from "@/lib/tools";

interface ToolLike {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  longDescription: string;
  category: ToolCategory;
  keywords: string[];
  status: "live" | "coming-soon";
  faq?: FAQItem[];
  howToUse?: HowToStep[];
  whyItMatters?: string;
  icon?: unknown;
}

export function ToolContent({ tool }: { tool: ToolLike }) {
  const relatedTools = tools
    .filter((t) => t.status === "live" && t.slug !== tool.slug && t.category === tool.category)
    .slice(0, 4);

  return (
    <div className="mt-12 space-y-10">
      {tool.whyItMatters && <WhyItMatters text={tool.whyItMatters} />}
      {tool.howToUse && tool.howToUse.length > 0 && <HowToUse steps={tool.howToUse} />}
      {tool.faq && tool.faq.length > 0 && <FAQSection faqs={tool.faq} />}
      {relatedTools.length > 0 && <RelatedTools tools={relatedTools} />}
    </div>
  );
}

function WhyItMatters({ text }: { text: string }) {
  return (
    <section className="rounded-xl border border-teal-100 bg-teal-50/50 p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        <Lightbulb className="h-5 w-5 text-teal-600" aria-hidden="true" />
        Why This Matters
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-700">{text}</p>
    </section>
  );
}

function HowToUse({ steps }: { steps: HowToStep[] }) {
  return (
    <section>
      <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        <Wrench className="h-5 w-5 text-slate-600" aria-hidden="true" />
        How to Use This Tool
      </h2>
      <ol className="mt-4 space-y-4">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
              {i + 1}
            </span>
            <div className="pt-1">
              <p className="text-sm font-semibold text-slate-900">{step.step}</p>
              <p className="mt-1 text-sm text-slate-600">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function FAQSection({ faqs }: { faqs: FAQItem[] }) {
  /*
   * 使用原生 <details>/<summary>：所有答案都渲染进静态 HTML，
   * 搜索引擎与不执行 JS 的 AI 爬虫（GPTBot/ClaudeBot 等）均可读取。
   */
  return (
    <section>
      <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        <HelpCircle className="h-5 w-5 text-slate-600" aria-hidden="true" />
        Frequently Asked Questions
      </h2>
      <div className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
        {faqs.map((faq, i) => (
          <details key={i} className="group" open={i === 0}>
            <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left [&::-webkit-details-marker]:hidden">
              <span className="text-sm font-medium text-slate-900">{faq.question}</span>
              <ChevronDown
                className="h-4 w-4 flex-shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <div className="px-5 pb-4">
              <p className="text-sm leading-relaxed text-slate-600">{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function RelatedTools({ tools: related }: { tools: Tool[] }) {
  return (
    <section>
      <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        <ListChecks className="h-5 w-5 text-slate-600" aria-hidden="true" />
        Related Tools
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.slug}
              href={`/tools/${t.slug}`}
              className="group flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 transition hover:border-teal-300 hover:shadow-sm"
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900 group-hover:text-teal-700">
                  {t.shortTitle}
                </p>
                <p className="truncate text-xs text-slate-500">{t.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
