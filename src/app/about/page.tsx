import type { Metadata } from "next";
import Link from "next/link";
import { liveTools } from "@/lib/tools";

export const metadata: Metadata = {
  title: "About A11yKit — Free Web Accessibility Tools for WCAG 2.2",
  description:
    "A11yKit is a free, open accessibility toolkit for WCAG 2.2 and EAA compliance. Learn about our mission and why these tools matter.",
  alternates: { canonical: "https://a11ykit.site/about" },
  openGraph: {
    title: "About A11yKit — Free Web Accessibility Tools for WCAG 2.2",
    description:
      "A11yKit is a free, open accessibility toolkit for WCAG 2.2 and EAA compliance. Learn about our mission and why these tools matter.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "About A11yKit" }],
  },
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "AboutPage",
                "@id": "https://a11ykit.site/about/#webpage",
                "url": "https://a11ykit.site/about",
                "name": "About A11yKit",
                "description": "A11yKit is a free, open accessibility toolkit for WCAG 2.2 and EAA compliance.",
                "isPartOf": { "@id": "https://a11ykit.site/#website" },
                "inLanguage": "en"
              },
              {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://a11ykit.site" },
                  { "@type": "ListItem", "position": 2, "name": "About", "item": "https://a11ykit.site/about" }
                ]
              }
            ]
          })
        }}
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">
        About A11yKit
      </h1>

      <div className="mt-8 space-y-6 text-slate-600">
        <p>
          A11yKit is a free collection of accessibility tools built for
          developers and designers who need to ensure their websites comply with
          WCAG 2.2 and the European Accessibility Act (EAA). All processing runs
          entirely in your browser — we have no backend that stores or analyzes
          your content, no account is required, and everything is free forever.
        </p>

        <h2 className="text-2xl font-semibold text-slate-900">Why we built this</h2>
        <p>
          The EAA became enforceable on June 28, 2025, requiring all businesses
          selling to EU consumers to meet WCAG 2.1 Level AA accessibility
          standards. Similar laws exist or are arriving in the US (ADA Title II,
          2026-2027), Canada (ACA), and across Asia. Yet existing accessibility
          tools are scattered across dozens of websites, many are paid
          SaaS products with limited free tiers, and none offer a complete
          free toolkit.
        </p>
        <p>
          A11yKit fills that gap with {liveTools.length} tools covering the full compliance
          workflow: from checking contrast ratios to generating accessibility
          statements, from auditing heading structure to simulating color
          blindness.
        </p>

        <h2 className="text-2xl font-semibold text-slate-900">Privacy first</h2>
        <p>
          Every tool runs client-side in your browser. Your HTML, your colors,
          your content — none of it is ever uploaded to our servers. There is no
          backend, no analytics on tool inputs, and no tracking of what you
          scan. Where a tool must reach the outside world — the URL Scanner
          fetches public page source through CORS proxies, and AI features call
          OpenAI with your own key — it is clearly labeled and explained in our
          Privacy Policy. This is especially important for accessibility audits
          of internal or staging environments that are not publicly accessible.
        </p>

        <h2 className="text-2xl font-semibold text-slate-900">Standards aligned</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>WCAG 2.2 (Web Content Accessibility Guidelines) — W3C</li>
          <li>EAA (European Accessibility Act) — Directive (EU) 2019/882</li>
          <li>EN 301 549 — European accessibility standard</li>
          <li>ADA Title II — US Department of Justice rule</li>
          <li>Section 508 — US federal accessibility standard</li>
          <li>WAI-ARIA 1.2 — Accessible Rich Internet Applications</li>
        </ul>

        <h2 className="text-2xl font-semibold text-slate-900">Our Digital Ecosystem & Sister Initiatives</h2>
        <p>
          A11yKit is part of a broader commitment to craft open, accessible, and high-impact digital experiences. We believe that whether you are writing code, drafting engineering schematics, or exploring timeless philosophical questions, digital tools should be barrier-free, fast, and respectful of user privacy.
        </p>
        <p>
          We also build and maintain dedicated digital initiatives across specialized domains:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Engineering & CAD Productivity:</strong> For designers and engineers,{" "}
            <a
              href="https://cadguide.tools/"
              target="_blank"
              rel="noopener"
              className="font-medium text-teal-700 underline hover:text-teal-800"
            >
              CAD Guide & Tools
            </a>{" "}
            provides instant command lookups and productivity workflows, while{" "}
            <a
              href="https://gstarcademy.com/"
              target="_blank"
              rel="noopener"
              className="font-medium text-teal-700 underline hover:text-teal-800"
            >
              Gstarcademy
            </a>{" "}
            delivers structured CAD masterclasses and tutorials for professional drafters.
          </li>
          <li>
            <strong>Wisdom & Philosophical Archives:</strong> For spiritual and cultural preservation, the{" "}
            <a
              href="https://ramanamaharshi.space/"
              target="_blank"
              rel="noopener"
              className="font-medium text-teal-700 underline hover:text-teal-800"
            >
              Sri Ramana Maharshi Wisdom Archive
            </a>{" "}
            digitizes non-dual Advaita Vedanta literature and self-enquiry dialogues, and the{" "}
            <a
              href="https://chanzong.space/"
              target="_blank"
              rel="noopener"
              className="font-medium text-teal-700 underline hover:text-teal-800"
            >
              Chanzong (Zen) Heritage Portal
            </a>{" "}
            curates classical koan texts and eastern contemplative thought in an accessible digital format.
          </li>
        </ul>
        <p>
          You can explore our complete cross-disciplinary collection on our{" "}
          <Link
            href="/projects"
            className="font-medium text-teal-700 underline hover:text-teal-800"
          >
            Featured Projects page
          </Link>
          .
        </p>

        <h2 className="text-2xl font-semibold text-slate-900">Disclaimer</h2>
        <p>
          A11yKit tools provide automated and semi-automated accessibility
          checks. Automated tools can detect many common issues but cannot
          catch all WCAG violations. A full accessibility audit should include
          manual testing with assistive technologies. These tools do not
          constitute legal advice.
        </p>
      </div>
    </div>
    </>
  );
}
