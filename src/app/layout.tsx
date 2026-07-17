import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PrivacyBanner } from "@/components/privacy-banner";
import { ServiceWorkerRegister } from "@/components/sw-register";

/* ── 字体优化：使用 next/font 本地化托管，消除渲染阻塞 ── */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "A11yKit — Free WCAG & EAA Accessibility Tools",
  description:
    "11 free online accessibility tools for WCAG 2.2 and EAA compliance. Contrast checker, WCAG checklist, and statement generator. 100% client-side.",
  metadataBase: new URL("https://a11ykit.site"),
  alternates: {
    canonical: "https://a11ykit.site",
  },
  robots: { index: true, follow: true },
  openGraph: {
    title: "A11yKit — Free WCAG & EAA Accessibility Tools",
    description:
      "11 free online accessibility tools for WCAG 2.2 and EAA compliance. No signup, 100% client-side.",
    type: "website",
    url: "https://a11ykit.site",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "A11yKit — Free WCAG & EAA Accessibility Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "A11yKit — Free WCAG & EAA Accessibility Tools",
    description:
      "11 free online accessibility tools for WCAG 2.2 and EAA compliance. No signup, 100% client-side.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover"
        />
        <meta name="theme-color" content="#28151a" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Sitemap 声明（GEO 规范） */}
        <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />

        {/* Security & Privacy Headers (GEO & Lighthouse Compliance) */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta name="author" content="A11yKit Team" />
        <meta name="publisher" content="A11yKit" />

        {/* Structured Data / 结构化数据 Graph (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://a11ykit.site/#organization",
                  "name": "A11yKit",
                  "url": "https://a11ykit.site",
                  "logo": "https://a11ykit.site/og-image.jpg",
                  "sameAs": [
                    "https://github.com/gstar-byte/a11ykit"
                  ],
                  "publishingPrinciples": "https://a11ykit.site/about"
                },
                {
                  "@type": "WebSite",
                  "@id": "https://a11ykit.site/#website",
                  "url": "https://a11ykit.site",
                  "name": "A11yKit",
                  "description": "11 free online accessibility tools for WCAG 2.2 and EAA compliance.",
                  "publisher": {
                    "@id": "https://a11ykit.site/#organization"
                  },
                  "inLanguage": "en"
                },
                {
                  "@type": "WebApplication",
                  "@id": "https://a11ykit.site/#webapp",
                  "name": "A11yKit Toolkit",
                  "url": "https://a11ykit.site",
                  "description": "11 free online accessibility tools for WCAG 2.2 and EAA compliance. Contrast checker, WCAG checklist, accessibility statement generator, and more. No signup, 100% client-side.",
                  "applicationCategory": "DeveloperApplication",
                  "operatingSystem": "All",
                  "screenshot": "https://a11ykit.site/og-image.jpg",
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                  },
                  "creator": {
                    "@id": "https://a11ykit.site/#organization"
                  }
                },
                {
                  "@type": "FAQPage",
                  "@id": "https://a11ykit.site/#faq",
                  "mainEntity": [
                    {
                      "@type": "Question",
                      "name": "What is the European Accessibility Act (EAA)?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "The European Accessibility Act (EAA Directive EU 2019/882) is an EU law enforced from June 2025 requiring digital services to meet WCAG 2.1 Level AA standards."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "Are A11yKit tools 100% free and client-side?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes, all A11yKit tools process data 100% client-side in your browser. No data is sent to external servers, and no user accounts are required."
                      }
                    }
                  ]
                }
              ]
            })
          }}
        />

        {/* Google tag (gtag.js) */}
        <script
          async
          defer
          src="https://www.googletagmanager.com/gtag/js?id=G-T1R22CCHQK"
        />
        <script
          defer
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              
              // 默认拒绝分析与广告的 Cookie 存储 (GDPR 合规最优解)
              gtag('consent', 'default', {
                'analytics_storage': 'denied',
                'ad_storage': 'denied'
              });
              
              gtag('js', new Date());
              gtag('config', 'G-T1R22CCHQK');
            `
          }}
        />
      </head>
      <body className="min-h-screen w-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        {/* Skip-to-content 无障碍跳转链接 */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-teal-700 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main-content" className="flex-grow w-full">{children}</main>
        <Footer />
        <PrivacyBanner />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
