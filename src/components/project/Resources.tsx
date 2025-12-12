import { ExternalLink, FileText, HelpCircle, Presentation, Mail } from "lucide-react";

interface Project {
  id: string;
  startup_name: string;
  stage: string;
}

const resources = {
  checklists: [
    {
      title: "Pre-Seed Fundraising Checklist",
      items: [
        "Validate problem-solution fit with 10+ customer interviews",
        "Build MVP or prototype demonstrating core value",
        "Identify 3-5 key metrics to track",
        "Create 10-slide pitch deck",
        "Research 50+ relevant pre-seed investors",
        "Warm intro strategy (identify connectors)",
        "One-pager or memo for async sharing",
        "Financial projections (12-24 month runway)",
        "Cap table prepared",
        "Data room with legal docs ready",
      ],
    },
    {
      title: "Pitch Deck Structure",
      items: [
        "Slide 1: Title + One-liner + Hook",
        "Slide 2: Problem (pain point, who has it)",
        "Slide 3: Solution (how you solve it)",
        "Slide 4: Market Size (TAM/SAM/SOM)",
        "Slide 5: Traction (metrics, growth)",
        "Slide 6: Business Model (how you make money)",
        "Slide 7: Team (why you can win)",
        "Slide 8: Competition (positioning)",
        "Slide 9: Ask + Use of Funds",
        "Slide 10: Vision + Contact",
      ],
    },
    {
      title: "Common Investor Questions",
      items: [
        "Why are you the right team to solve this?",
        "What's your unfair advantage?",
        "How did you arrive at this market size?",
        "What happens if [big tech company] builds this?",
        "What's your CAC and LTV?",
        "How will you spend the money?",
        "What milestones will this round achieve?",
        "Who else is investing / interested?",
        "What's your biggest risk?",
        "Why now? What's changed?",
      ],
    },
  ],
  links: [
    {
      title: "YC Library: Startup Fundamentals",
      url: "https://www.ycombinator.com/library",
      icon: FileText,
    },
    {
      title: "First Round Review",
      url: "https://review.firstround.com",
      icon: FileText,
    },
    {
      title: "Pitch Deck Examples Database",
      url: "https://www.pitchdeckhunt.com",
      icon: Presentation,
    },
    {
      title: "OpenVC Investor Database",
      url: "https://openvc.app",
      icon: Mail,
    },
  ],
};

export function Resources({ project }: { project: Project }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-foreground">Resources</h2>
        <p className="text-muted-foreground">
          Curated guides and checklists to help you prepare
        </p>
      </div>

      {/* Checklists */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.checklists.map((checklist) => (
          <div
            key={checklist.title}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="font-display text-lg text-foreground">
                {checklist.title}
              </h3>
            </div>
            <ul className="space-y-2">
              {checklist.items.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="w-5 h-5 rounded-full border border-border flex items-center justify-center flex-shrink-0 text-xs">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* External Links */}
      <div>
        <h3 className="font-display text-xl text-foreground mb-4">
          Helpful Links
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {resources.links.map((link) => (
            <a
              key={link.title}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-glow transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <link.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground">{link.title}</h4>
                <p className="text-sm text-muted-foreground truncate">
                  {link.url}
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </a>
          ))}
        </div>
      </div>

      {/* Stage-specific advice */}
      <div className="bg-gradient-ocean rounded-2xl p-6 text-primary-foreground">
        <h3 className="font-display text-xl mb-2">
          Pro Tip for {project.stage === "pre-seed" ? "Pre-Seed" : project.stage} Stage
        </h3>
        <p className="text-primary-foreground/80">
          {project.stage === "idea" || project.stage === "pre-seed"
            ? "At the pre-seed stage, investors bet on teams and markets, not metrics. Focus your pitch on why you're uniquely positioned to win and the size of the opportunity."
            : project.stage === "seed"
            ? "Seed investors want to see early signals of product-market fit. Highlight user engagement, retention, and any evidence that customers love your product."
            : "As you grow, investors expect strong unit economics. Make sure you can articulate your CAC, LTV, and path to profitability."}
        </p>
      </div>
    </div>
  );
}
