import Link from "next/link";
import { Accessibility, ExternalLink } from "lucide-react";
import { liveTools } from "@/lib/tools";
import { projects } from "@/lib/projects";
import { ContactButton } from "@/components/contact-button";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white">
                <Accessibility className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                A11y<span className="text-teal-700">Kit</span>
              </span>
            </div>
            <p className="mt-4 max-w-md text-sm text-slate-600">
              Free accessibility tools for WCAG 2.2 and EAA compliance. Built for
              developers and designers who care about digital inclusion. No
              signup, privacy-first, 100% client-side.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Check & Fix</h3>
            <ul className="mt-4 space-y-2">
              {liveTools.filter((t) => t.category === "check" || t.category === "fix").map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="text-sm text-slate-600 hover:text-teal-700"
                  >
                    {tool.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Generate & Simulate</h3>
            <ul className="mt-4 space-y-2">
              {liveTools.filter((t) => t.category === "generate" || t.category === "simulate" || t.category === "monitor").map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="text-sm text-slate-600 hover:text-teal-700"
                  >
                    {tool.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Resources</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/projects"
                  className="text-sm font-medium text-teal-700 hover:text-teal-800"
                >
                  Featured Projects ✦
                </Link>
              </li>
              <li>
                <Link
                  href="/accessibility-report"
                  className="text-sm text-slate-600 hover:text-teal-700"
                >
                  Accessibility Audit Report
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-slate-600 hover:text-teal-700"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-slate-600 hover:text-teal-700"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-slate-600 hover:text-teal-700"
                >
                  Terms of Use
                </Link>
              </li>
              <li>
                <a
                  href="/llms.txt"
                  className="text-sm text-slate-600 hover:text-teal-700"
                >
                  llms.txt (AI)
                </a>
              </li>
              <li>
                <ContactButton className="text-sm text-slate-600 hover:text-teal-700 text-left" />
              </li>
              <li>
                <a
                  href="https://www.w3.org/WAI/standards-guidelines/wcag/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-600 hover:text-teal-700"
                >
                  WCAG 2.2 Guidelines ↗
                </a>
              </li>
              <li>
                <a
                  href="https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/disability/european-accessibility-act-eaa_en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-600 hover:text-teal-700"
                >
                  European Accessibility Act ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Sister Projects & Backlinks */}
        <div className="mt-12 border-t border-slate-200 pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Our Digital Ecosystem & Sister Projects
            </h4>
            <Link
              href="/projects"
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1"
            >
              Explore All Projects ↗
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {projects.map((p) => (
              <a
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noopener"
                className="group rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 transition hover:bg-white hover:border-teal-300 hover:shadow-xs"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 group-hover:text-teal-700">
                  <span className="truncate">{p.shortTitle}</span>
                  <ExternalLink className="h-3 w-3 flex-shrink-0 text-slate-400 group-hover:text-teal-700 transition" aria-hidden="true" />
                </div>
                <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                  {p.tagline}
                </p>
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <p className="text-sm text-slate-600">
            © {new Date().getFullYear()} A11yKit. Free accessibility tools for
            everyone. WCAG is a trademark of W3C. EAA refers to Directive (EU)
            2019/882.
          </p>
        </div>
      </div>
    </footer>
  );
}
