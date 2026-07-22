import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — A11yKit",
  description:
    "A11yKit privacy policy. All tools run 100% client-side. We use Google Analytics with consent-based tracking. No personal data is collected or stored on our servers.",
  alternates: { canonical: "https://a11ykit.site/privacy" },
  openGraph: {
    title: "Privacy Policy — A11yKit",
    description:
      "All tools run 100% client-side. We use Google Analytics with consent-based tracking.",
  },
};

export default function PrivacyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://a11ykit.site" },
              { "@type": "ListItem", "position": 2, "name": "Privacy Policy", "item": "https://a11ykit.site/privacy" }
            ]
          })
        }}
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-slate-600">
          <li>
            <Link href="/" className="hover:text-teal-700">Home</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-slate-900 font-medium">
            Privacy Policy
          </li>
        </ol>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: July 17, 2026</p>

      <div className="mt-8 space-y-8 text-slate-700">
        <section>
          <h2 className="text-xl font-semibold text-slate-900">Overview</h2>
          <p className="mt-3 leading-relaxed">
            A11yKit is committed to your privacy. All accessibility tools on this
            website run entirely in your browser — your HTML, images, colors, PDF
            files, and other inputs are never transmitted to or stored on our
            servers. This document explains the limited data we do collect and
            how it is used.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">
            Data We Do Not Collect
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>HTML code, URLs, or page content you scan or analyze</li>
            <li>Images you upload to the Alt Text Generator or Color Blindness Simulator</li>
            <li>PDF files you upload to the PDF Accessibility Checker</li>
            <li>Color values you enter in the Contrast Checker</li>
            <li>Your OpenAI API key (used directly from your browser to call OpenAI)</li>
            <li>WCAG Checklist progress or Accessibility Monitor scan results (stored in your browser&apos;s localStorage only)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">
            Google Analytics
          </h2>
          <p className="mt-3 leading-relaxed">
            We use Google Analytics to understand aggregate traffic patterns and
            improve the website. Google Analytics uses cookies to collect
            anonymous usage data such as page views, session duration, and
            approximate geographic region.
          </p>
          <p className="mt-3 leading-relaxed">
            We follow a consent-based model. Analytics tracking is{" "}
            <strong>disabled by default</strong> and is only enabled if you
            explicitly accept analytics cookies in our cookie banner. You can
            change your preference at any time by clicking the shield icon in the
            bottom-right corner.
          </p>
          <p className="mt-3 leading-relaxed">
            For more information on how Google handles data, see the{" "}
            <a
              href="https://policies.google.com/technologies/partner-sites"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-700 hover:underline"
            >
              Google Privacy &amp; Terms page ↗
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">
            Local Storage
          </h2>
          <p className="mt-3 leading-relaxed">
            We use your browser&apos;s localStorage to save:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Your cookie consent preferences</li>
            <li>WCAG Checklist progress (if you use the tool)</li>
            <li>Accessibility Monitor scan history (if you use the tool)</li>
            <li>Accessibility Statement form data (if you use the tool)</li>
          </ul>
          <p className="mt-3 leading-relaxed">
            This data never leaves your device. Clearing your browser data will
            remove all stored information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">
            Third-Party Services
          </h2>
          <div className="mt-3 space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900">OpenAI API</h3>
              <p className="mt-1 leading-relaxed">
                The AI Alt Text Generator and AI Statement Generator call the
                OpenAI API directly from your browser using your own API key.
                Your API key and image data are sent directly to OpenAI and are
                never routed through our servers. See{" "}
                <a
                  href="https://openai.com/policies/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-700 hover:underline"
                >
                  OpenAI&apos;s Privacy Policy ↗
                </a>
                .
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">CORS Proxies</h3>
              <p className="mt-1 leading-relaxed">
                The URL Scanner uses public CORS proxy services to fetch page
                HTML. The URL you enter is sent to the proxy to retrieve the
                page source. No other data is transmitted, and all analysis
                happens in your browser.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Cookies</h2>
          <p className="mt-3 leading-relaxed">
            We use the following cookie categories:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              <strong>Essential:</strong> Stores your cookie consent
              preferences. Required for the site to function.
            </li>
            <li>
              <strong>Analytics (optional):</strong> Google Analytics cookies
              for anonymous traffic measurement. Disabled by default.
            </li>
            <li>
              <strong>Marketing (optional):</strong> We do not currently use any
              marketing cookies and do not display advertisements.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">
            Your Rights
          </h2>
          <p className="mt-3 leading-relaxed">
            Depending on your jurisdiction, you may have the right to:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Access the personal data we hold about you</li>
            <li>Request deletion of your personal data</li>
            <li>Object to or restrict processing of your data</li>
            <li>Withdraw consent for analytics tracking at any time</li>
          </ul>
          <p className="mt-3 leading-relaxed">
            Since we do not collect personal data on our servers, most rights
            can be exercised by clearing your browser data. For any questions,
            contact us at <a href="mailto:privacy@a11ykit.site" className="text-teal-700 hover:underline">privacy@a11ykit.site</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">
            Children&apos;s Privacy
          </h2>
          <p className="mt-3 leading-relaxed">
            A11yKit is not directed at children under 13. We do not knowingly
            collect personal information from children. If you believe a child
            has provided us with personal data, please contact us and we will
            take appropriate action.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">
            Changes to This Policy
          </h2>
          <p className="mt-3 leading-relaxed">
            We may update this Privacy Policy from time to time. Changes will be
            posted on this page with an updated revision date. We encourage you
            to review this page periodically.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Contact</h2>
          <p className="mt-3 leading-relaxed">
            If you have questions about this Privacy Policy, email{" "}
            <a href="mailto:privacy@a11ykit.site" className="text-teal-700 hover:underline">
              privacy@a11ykit.site
            </a>
            .
          </p>
        </section>
      </div>
    </div>
    </>
  );
}
