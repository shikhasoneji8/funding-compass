import { Lightbulb, FileText, Users, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Lightbulb,
    title: "Share Your Vision",
    description: "Tell us about your startup, the problem you solve, and your funding goals in one simple flow.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: FileText,
    title: "Get Your Pitch",
    description: "Our AI generates a compelling 30-second pitch, 2-minute pitch, deck outline, and investor emails.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Users,
    title: "Build Your Pipeline",
    description: "Add investors to your CRM, track outreach status, and never miss a follow-up.",
    color: "bg-ocean-mid/10 text-ocean-mid",
  },
  {
    icon: TrendingUp,
    title: "Close Your Round",
    description: "Practice your pitch, refine your materials, and move from intro to term sheet.",
    color: "bg-accent/10 text-accent",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-gradient-surface">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
            How FundingNEMO Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From first idea to funded startup in four simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative group"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-border" />
              )}
              
              <div className="relative bg-card rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-border/50">
                {/* Step number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>
                
                <div className={`w-14 h-14 rounded-xl ${step.color} flex items-center justify-center mb-4`}>
                  <step.icon className="w-7 h-7" />
                </div>
                
                <h3 className="font-display text-xl text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
