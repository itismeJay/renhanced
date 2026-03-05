import React from "react";
import { Check, Zap, Crown, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/homepage/Footer";

export const metadata = {
  title: "Pricing - DevResumeAI",
  description:
    "Choose the perfect plan for your job search. Start free, upgrade when you need more features.",
};

const plans = [
  {
    name: "Free",
    description: "Perfect for getting started",
    price: "$0",
    period: "forever",
    icon: Zap,
    features: [
      "1 resume",
      "Basic AI scoring",
      "ATS compatibility check",
      "PDF export",
      "Community support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    description: "For serious job seekers",
    price: "$19",
    period: "/month",
    icon: Crown,
    features: [
      "Unlimited resumes",
      "Advanced AI scoring",
      "Role-specific evaluation",
      "Big Tech readiness check",
      "Keyword optimization",
      "Version history",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For teams & organizations",
    price: "$99",
    period: "/month",
    icon: Rocket,
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Admin dashboard",
      "Custom branding",
      "API access",
      "Dedicated support",
      "Analytics dashboard",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Simple, Transparent <span className="gradient-text">Pricing</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Start free and upgrade when you're ready to land your dream job.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {plans.map((plan) => {
                const Icon = plan.icon;
                return (
                  <div
                    key={plan.name}
                    className={`relative bg-card rounded-2xl border p-6 lg:p-8 ${
                      plan.popular ? "border-primary shadow-lg scale-105" : "border-border"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          plan.popular ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div>
                      <Button variant={plan.popular ? "gradient" : "outline"} className="w-full">
                        {plan.cta}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
