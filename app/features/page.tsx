import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/homepage/Footer";
import { FeaturesSection } from "@/components/homepage/FeaturesSection";

export const metadata = {
  title: "Features - DevResumeAI",
  description:
    "Powerful resume tools: AI suggestions, ATS scoring, templates, and exports.",
};

export default function FeaturesPage() {
  return (
    <>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32">
          <FeaturesSection />
        </main>
        <Footer />
      </div>
    </>
  );
}
