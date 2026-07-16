import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PrivacyBanner } from "@/components/privacy-banner";

export const metadata: Metadata = {
  title: "A11yKit — Free WCAG & EAA Accessibility Tools",
  description:
    "11 free online accessibility tools for WCAG 2.2 and EAA compliance. Contrast checker, WCAG checklist, accessibility statement generator, ARIA generator, and more. No signup, 100% client-side.",
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
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover"
        />
        <meta name="theme-color" content="#28151a" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-T1R22CCHQK"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            
            // 默认拒绝分析与广告的 Cookie 存储 (GDPR 合规最优解)
            gtag('consent', 'default', {
              'analytics_storage': 'denied',
              'ad_storage': 'denied'
            });
            
            gtag('js', new Date());
            gtag('config', 'G-T1R22CCHQK');
          `}
        </Script>

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen w-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <Navbar />
        <main className="flex-grow w-full">{children}</main>
        <Footer />
        <PrivacyBanner />
      </body>
    </html>
  );
}
