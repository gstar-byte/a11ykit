import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — A11yKit",
  description:
    "A11yKit is a free, open accessibility toolkit for WCAG 2.2 and EAA compliance. Learn about our mission and why these tools matter.",
  alternates: { canonical: "https://a11ykit.site/about" },
  openGraph: {
    title: "About — A11yKit",
    description:
      "A11yKit is a free, open accessibility toolkit for WCAG 2.2 and EAA compliance. Learn about our mission and why these tools matter.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "About A11yKit" }],
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">
        About A11yKit
      </h1>

      <div className="mt-8 space-y-6 text-slate-600">
        <p>
          A11yKit is a free collection of accessibility tools built for
          developers and designers who need to ensure their websites comply with
          WCAG 2.2 and the European Accessibility Act (EAA). All tools run
          entirely in your browser — no data is sent to any server, no account
          is required, and everything is free forever.
        </p>

        <h2 className="text-2xl font-semibold text-slate-900">Why we built this</h2>
        <p>
          The EAA became enforceable on June 28, 2025, requiring all businesses
          selling to EU consumers to meet WCAG 2.1 Level AA accessibility
          standards. Similar laws exist or are arriving in the US (ADA Title II,
          2027-2028), Canada (ACA), and across Asia. Yet existing accessibility
          tools are scattered across dozens of websites, many are paid
          SaaS products with limited free tiers, and none offer a complete
          free toolkit.
        </p>
        <p>
          A11yKit fills that gap with 11 tools covering the full compliance
          workflow: from checking contrast ratios to generating accessibility
          statements, from auditing heading structure to simulating color
          blindness.
        </p>

        <h2 className="text-2xl font-semibold text-slate-900">Privacy first</h2>
        <p>
          Every tool runs client-side in your browser. Your HTML, your colors,
          your content — none of it ever leaves your device. There is no
          backend, no analytics on tool inputs, and no tracking. This is
          especially important for accessibility audits of internal or
          staging environments that are not publicly accessible.
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
  );
}
