import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use — A11yKit",
  description:
    "A11yKit terms of use. Free accessibility tools provided as-is. No warranty, no liability. AI-generated content must be reviewed before publishing.",
  alternates: { canonical: "https://a11ykit.site/terms" },
  openGraph: {
    title: "Terms of Use — A11yKit",
    description:
      "Free accessibility tools provided as-is. No warranty, no liability.",
  },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-slate-600">
          <li>
            <Link href="/" className="hover:text-teal-700">Home</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-slate-900 font-medium">
            Terms of Use
          </li>
        </ol>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Terms of Use</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: July 17, 2026</p>

      <div className="mt-8 space-y-8 text-slate-700">
        <section>
          <h2 className="text-xl font-semibold text-slate-900">Acceptance of Terms</h2>
          <p className="mt-3 leading-relaxed">
            By accessing or using A11yKit (the &quot;Service&quot;), you agree to
            be bound by these Terms of Use. If you do not agree with any part of
            these terms, please do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Description of Service</h2>
          <p className="mt-3 leading-relaxed">
            A11yKit provides free, browser-based accessibility testing tools,
            including but not limited to contrast checking, WCAG compliance
            checklists, HTML and URL scanning, ARIA markup generation,
            accessibility statement generation, color blindness simulation,
            PDF accessibility checking, and AI-powered alt text generation.
            All tools run client-side in your browser unless otherwise noted.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">No Warranty</h2>
          <p className="mt-3 leading-relaxed">
            The Service is provided &quot;as is&quot; and &quot;as available&quot;
            without warranties of any kind, either express or implied. We do not
            guarantee that the tools will identify all accessibility issues,
            produce error-free results, or meet your specific requirements.
          </p>
          <p className="mt-3 leading-relaxed">
            Automated accessibility tools can detect many common WCAG violations
            but cannot replace manual testing with assistive technologies. A
            passing scan does not guarantee WCAG compliance, and a failing scan
            does not constitute a definitive legal determination.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">
            AI-Generated Content
          </h2>
          <p className="mt-3 leading-relaxed">
            The AI Alt Text Generator and AI Statement Generator use
            OpenAI&apos;s API to produce text suggestions. AI-generated content
            may contain inaccuracies, biased language, or inappropriate
            descriptions. You are solely responsible for reviewing, editing, and
            approving any AI-generated content before publishing it on your
            website.
          </p>
          <p className="mt-3 leading-relaxed">
            Your use of the OpenAI API is subject to{" "}
            <a
              href="https://openai.com/policies/terms-of-use"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-700 hover:underline"
            >
              OpenAI&apos;s Terms of Use ↗
            </a>
            . You are responsible for any costs incurred through your own API
            key usage.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">
            Limitation of Liability
          </h2>
          <p className="mt-3 leading-relaxed">
            To the maximum extent permitted by law, A11yKit and its contributors
            shall not be liable for any direct, indirect, incidental,
            consequential, or special damages arising from your use of or
            inability to use the Service. This includes, but is not limited to,
            damages related to accessibility compliance failures, legal
            proceedings, loss of data, or business interruption.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">
            Not Legal Advice
          </h2>
          <p className="mt-3 leading-relaxed">
            The tools and content provided by A11yKit are for informational and
            testing purposes only. They do not constitute legal advice and
            should not be relied upon as a substitute for consultation with
            qualified legal professionals regarding accessibility compliance
            obligations under the ADA, Section 508, EAA, or other applicable
            laws.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">
            Acceptable Use
          </h2>
          <p className="mt-3 leading-relaxed">You agree not to:</p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Use the Service to scan websites you do not own or have permission to test</li>
            <li>Attempt to reverse engineer, decompile, or otherwise extract source code</li>
            <li>Use the Service in a manner that could damage, disable, or impair the website</li>
            <li>Use the URL Scanner to excessively crawl or overload third-party websites</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">
            Intellectual Property
          </h2>
          <p className="mt-3 leading-relaxed">
            A11yKit&apos;s source code is publicly available. The A11yKit name,
            logo, and website design are the property of A11yKit. WCAG is a
            trademark of the World Wide Web Consortium (W3C). EAA refers to
            Directive (EU) 2019/882. axe-core is maintained by Deque Systems.
            All other trademarks belong to their respective owners.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">
            Third-Party Links
          </h2>
          <p className="mt-3 leading-relaxed">
            The Service may contain links to third-party websites and
            resources. We are not responsible for the content, privacy
            practices, or terms of use of any third-party sites. You access
            third-party websites at your own risk.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">
            Changes to These Terms
          </h2>
          <p className="mt-3 leading-relaxed">
            We may revise these Terms of Use at any time. Continued use of the
            Service after changes are posted constitutes your acceptance of the
            updated terms. We encourage you to review this page periodically.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Contact</h2>
          <p className="mt-3 leading-relaxed">
            If you have questions about these Terms of Use, email{" "}
            <a href="mailto:legal@a11ykit.site" className="text-teal-700 hover:underline">
              legal@a11ykit.site
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
