import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/homepage/Footer";

export const metadata = {
  title: "Resume Templates - DevResumeAI",
  description:
    "Choose from professional, ATS-optimized resume templates designed for software engineers and tech professionals.",
};

const templates = [
  {
    id: "jake-ryan",
    name: "Jake Ryan",
    description:
      "The classic LaTeX-style template loved by software engineers. Clean, minimal, and highly ATS-compatible.",
    category: "Software Engineer",
    isPro: false,
    features: ["Single Column", "ATS-Optimized", "Clean Typography", "LaTeX Style"],
    popularFor: ["Software Engineers", "Backend Developers", "New Grads"],
  },
  {
    id: "jake-taylor",
    name: "Jake Taylor",
    description:
      "A professional variant with enhanced formatting. Perfect for experienced developers with substantial work history.",
    category: "Experienced Developer",
    isPro: false,
    features: ["Single Column", "ATS-Optimized", "Professional", "Industry Standard"],
    popularFor: ["Senior Engineers", "Tech Leads", "Staff Engineers"],
  },
  {
    id: "harvard",
    name: "Harvard",
    description:
      "Traditional academic format trusted by Ivy League career services. Professional and timeless design.",
    category: "All Roles",
    isPro: false,
    features: ["Traditional Layout", "Professional", "ATS-Friendly", "Recruiter Approved"],
    popularFor: ["All Roles", "Career Changers", "Academia"],
  },
  {
    id: "modern-tech",
    name: "Modern Tech",
    description:
      "Contemporary two-column layout designed for tech roles. Emphasizes skills and projects with a modern aesthetic.",
    category: "Tech Roles",
    isPro: true,
    features: ["Two Column", "Skills Focus", "Modern Design", "Visual Appeal"],
    popularFor: ["Startups", "Product Roles", "Creative Tech"],
  },
  {
    id: "faang-ready",
    name: "FAANG Ready",
    description:
      "Optimized format based on successful Big Tech resumes. Emphasizes impact metrics and system design.",
    category: "Big Tech",
    isPro: true,
    features: ["Impact Focused", "Metrics Heavy", "System Design", "Interview Ready"],
    popularFor: ["FAANG", "Big Tech", "L5+ Roles"],
  },
];

export default function TemplatesPage() {
  return (
    <>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Professional <span className="gradient-text">Resume Templates</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                ATS-optimized templates designed specifically for software engineers and tech professionals.
              </p>
              <Link href="/resumes/new">
                <Button variant="hero" size="lg" className="gap-2">
                  Start Building
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`bg-card rounded-xl border p-6 ${
                    template.isPro ? "border-primary/50" : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground text-lg">{template.name}</h3>
                    {template.isPro && (
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1">
                        <Crown className="w-3 h-3" />
                        PRO
                      </Badge>
                    )}
                  </div>

                  <Badge variant="secondary" className="mb-3">{template.category}</Badge>

                  <p className="text-sm text-muted-foreground mb-4">{template.description}</p>

                  <div className="space-y-2 mb-4">
                    {template.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2">Popular for:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.popularFor.map((role) => (
                        <Badge key={role} variant="outline" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Link href={template.isPro ? "/pricing" : `/resumes/new/edit?template=${template.id}`}>
                    <Button
                      variant={template.isPro ? "outline" : "gradient"}
                      className="w-full"
                    >
                      {template.isPro ? "Upgrade to Use" : "Use Template"}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
