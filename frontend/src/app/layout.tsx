import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Premium Exam Prep | IAS, SSC, Banking & Competitive Exam Mock Tests",
  description: "Boost your exam prep score with Previous Year Questions, high-quality Study Notes, interactive Topic Practice, and real Full-Length Mock Tests.",
  openGraph: {
    title: "Premium Exam Prep | Complete Exam Prep SaaS Platform",
    description: "Access high-quality mock tests, adaptive practice questions, premium notes, and comprehensive analytics reports.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "ExamPrep Pro",
    "description": "Premium Exam Preparation Platform for UPSC, SSC, Banking, and State PSC Exams.",
    "url": "http://localhost:3000",
    "logo": "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200",
    "sameAs": [
      "https://twitter.com/examprep_pro",
      "https://facebook.com/examprep_pro"
    ]
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased bg-[#F8FAFC] text-slate-900 min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
