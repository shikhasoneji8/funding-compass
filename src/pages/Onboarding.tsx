import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, User, Rocket, Lightbulb, DollarSign, Check, HelpCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FormData {
  // Founder
  fullName: string;
  email: string;
  linkedinUrl: string;
  location: string;
  background: string;
  raisingStage: string;
  // Startup
  startupName: string;
  oneLiner: string;
  category: string;
  stage: string;
  website: string;
  tractionUsers: string;
  tractionRevenue: string;
  tractionGrowth: string;
  teamSize: string;
  // Problem/Solution
  problemStatement: string;
  solutionDescription: string;
  targetUsers: string;
  whyNow: string;
  differentiation: string;
  competition: string;
  // Funding
  askAmount: string;
  useOfFunds: string;
  businessModel: string;
  goToMarket: string;
  pitchTone: string;
}

const initialFormData: FormData = {
  fullName: "",
  email: "",
  linkedinUrl: "",
  location: "",
  background: "",
  raisingStage: "",
  startupName: "",
  oneLiner: "",
  category: "",
  stage: "",
  website: "",
  tractionUsers: "",
  tractionRevenue: "",
  tractionGrowth: "",
  teamSize: "",
  problemStatement: "",
  solutionDescription: "",
  targetUsers: "",
  whyNow: "",
  differentiation: "",
  competition: "",
  askAmount: "",
  useOfFunds: "",
  businessModel: "",
  goToMarket: "",
  pitchTone: "professional",
};

const requiredFields: (keyof FormData)[] = [
  "fullName",
  "email",
  "startupName",
  "oneLiner",
  "category",
  "stage",
  "problemStatement",
  "solutionDescription",
  "targetUsers",
];

const fieldTooltips: Partial<Record<keyof FormData, string>> = {
  askAmount: "Typical ranges: Pre-seed $50K-$500K, Seed $500K-$2M, Series A $2M-$15M. Base on 12-18 months of runway.",
  useOfFunds: "Common allocations: 40-60% Engineering/Product, 20-30% Sales/Marketing, 10-20% Operations. Be specific!",
  businessModel: "Examples: SaaS subscription, Freemium, Marketplace fees, Transaction fees, Usage-based pricing, Licensing.",
  goToMarket: "Describe your customer acquisition strategy: direct sales, content marketing, partnerships, PLG, etc.",
};

const fieldLabels: Record<keyof FormData, string> = {
  fullName: "Full Name",
  email: "Email",
  linkedinUrl: "LinkedIn URL",
  location: "Location",
  background: "Background",
  raisingStage: "Raising Stage",
  startupName: "Startup Name",
  oneLiner: "One-liner",
  category: "Category",
  stage: "Stage",
  website: "Website",
  tractionUsers: "Users",
  tractionRevenue: "Revenue",
  tractionGrowth: "MoM Growth",
  teamSize: "Team Size",
  problemStatement: "Problem Statement",
  solutionDescription: "Solution Description",
  targetUsers: "Target Users",
  whyNow: "Why Now",
  differentiation: "Differentiation",
  competition: "Competition",
  askAmount: "Ask Amount",
  useOfFunds: "Use of Funds",
  businessModel: "Business Model",
  goToMarket: "Go-to-Market",
  pitchTone: "Pitch Tone",
};

const steps = [
  { id: 1, title: "Founder", icon: User },
  { id: 2, title: "Startup", icon: Rocket },
  { id: 3, title: "Problem & Solution", icon: Lightbulb },
  { id: 4, title: "Funding", icon: DollarSign },
];

export default function Onboarding() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [activeStep, setActiveStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const formRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || "",
        fullName: user.user_metadata?.full_name || "",
      }));
    }
  }, [user, authLoading, navigate]);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    requiredFields.forEach(field => {
      if (!formData[field]?.trim()) {
        newErrors[field] = `Please complete the ${fieldLabels[field]} field before proceeding.`;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Find the first error and scroll to it
      const firstErrorField = requiredFields.find(f => newErrors[f]);
      if (firstErrorField && formRefs.current[firstErrorField]) {
        formRefs.current[firstErrorField]?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    setSaving(true);

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName,
          linkedin_url: formData.linkedinUrl,
          location: formData.location,
          background: formData.background,
          raising_stage: formData.raisingStage,
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      // Create project
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          startup_name: formData.startupName,
          one_liner: formData.oneLiner,
          category: formData.category,
          stage: formData.stage,
          website: formData.website,
          traction_users: formData.tractionUsers,
          traction_revenue: formData.tractionRevenue,
          traction_growth: formData.tractionGrowth,
          team_size: formData.teamSize,
          problem_statement: formData.problemStatement,
          solution_description: formData.solutionDescription,
          target_users: formData.targetUsers,
          why_now: formData.whyNow,
          differentiation: formData.differentiation,
          competition: formData.competition,
          ask_amount: formData.askAmount,
          use_of_funds: formData.useOfFunds,
          business_model: formData.businessModel,
          go_to_market: formData.goToMarket,
          pitch_tone: formData.pitchTone,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      toast.success("Project created! Generating your pitch...");
      navigate(`/project/${project.id}`);
    } catch (error: any) {
      console.error("Error saving:", error);
      toast.error(error.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderField = (
    field: keyof FormData,
    type: "input" | "textarea" | "select",
    options?: { value: string; label: string }[],
    props?: { placeholder?: string }
  ) => {
    const isRequired = requiredFields.includes(field);
    const hasError = !!errors[field];
    const tooltip = fieldTooltips[field];

    return (
      <div
        className="space-y-2"
        ref={(el) => (formRefs.current[field] = el)}
      >
        <Label htmlFor={field} className="flex items-center gap-1">
          {fieldLabels[field]}
          {isRequired && <span className="text-destructive">*</span>}
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help ml-1" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-sm">
                  <p>{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </Label>
        
        {type === "input" && (
          <Input
            id={field}
            value={formData[field]}
            onChange={(e) => updateField(field, e.target.value)}
            placeholder={props?.placeholder}
            error={hasError}
          />
        )}
        
        {type === "textarea" && (
          <Textarea
            id={field}
            value={formData[field]}
            onChange={(e) => updateField(field, e.target.value)}
            placeholder={props?.placeholder}
            error={hasError}
          />
        )}
        
        {type === "select" && options && (
          <Select
            value={formData[field]}
            onValueChange={(value) => updateField(field, value)}
          >
            <SelectTrigger className={hasError ? "border-destructive" : ""}>
              <SelectValue placeholder={props?.placeholder || "Select..."} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        {hasError && (
          <p className="text-sm text-destructive">{errors[field]}</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="md" />
          <div className="text-sm text-muted-foreground">
            {user?.email}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                activeStep === step.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <step.icon className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">{step.title}</span>
            </button>
          ))}
        </div>

        {/* Form Sections */}
        <div className="space-y-8">
          {/* Step 1: Founder */}
          <section
            className={`bg-card rounded-2xl border border-border p-6 md:p-8 transition-all ${
              activeStep === 1 ? "ring-2 ring-primary/20" : ""
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-xl text-foreground">Founder Details</h2>
                <p className="text-sm text-muted-foreground">Tell us about yourself</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {renderField("fullName", "input", undefined, { placeholder: "Jane Smith" })}
              {renderField("email", "input", undefined, { placeholder: "you@startup.com" })}
              {renderField("linkedinUrl", "input", undefined, { placeholder: "linkedin.com/in/janesmith" })}
              <div className="space-y-2" ref={(el) => (formRefs.current["location"] = el)}>
                <Label htmlFor="location">Location</Label>
                <LocationAutocomplete
                  id="location"
                  value={formData.location}
                  onChange={(value) => updateField("location", value)}
                  placeholder="Search for your city..."
                  error={!!errors.location}
                />
                {errors.location && (
                  <p className="text-sm text-destructive">{errors.location}</p>
                )}
              </div>
              {renderField("raisingStage", "select", [
                { value: "idea-stage", label: "Idea Stage" },
                { value: "pre-seed", label: "Pre-seed" },
                { value: "seed", label: "Seed" },
                { value: "series-a", label: "Series A" },
                { value: "bootstrapping", label: "Bootstrapping" },
                { value: "not-raising", label: "Not Raising" },
                { value: "dont-know", label: "Don't know" },
              ], { placeholder: "What are you raising?" })}
              <div className="md:col-span-2">
                {renderField("background", "textarea", undefined, { placeholder: "Your experience, domain expertise, and what drives you..." })}
              </div>
            </div>
          </section>

          {/* Step 2: Startup */}
          <section
            className={`bg-card rounded-2xl border border-border p-6 md:p-8 transition-all ${
              activeStep === 2 ? "ring-2 ring-primary/20" : ""
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-xl text-foreground">Startup Details</h2>
                <p className="text-sm text-muted-foreground">Tell us about your startup</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {renderField("startupName", "input", undefined, { placeholder: "Acme Inc" })}
              {renderField("oneLiner", "input", undefined, { placeholder: "We help X do Y with Z" })}
              {renderField("category", "select", [
                { value: "saas", label: "SaaS" },
                { value: "fintech", label: "Fintech" },
                { value: "healthtech", label: "Healthtech" },
                { value: "edtech", label: "Edtech" },
                { value: "ai-ml", label: "AI/ML" },
                { value: "marketplace", label: "Marketplace" },
                { value: "consumer", label: "Consumer" },
                { value: "hardware", label: "Hardware" },
                { value: "climate", label: "Climate" },
                { value: "other", label: "Other" },
              ], { placeholder: "Select category" })}
              {renderField("stage", "select", [
                { value: "idea", label: "Idea" },
                { value: "mvp", label: "MVP" },
                { value: "beta", label: "Beta" },
                { value: "launched", label: "Launched" },
                { value: "growing", label: "Growing" },
              ], { placeholder: "Select stage" })}
              {renderField("website", "input", undefined, { placeholder: "https://acme.com" })}
              {renderField("teamSize", "input", undefined, { placeholder: "2" })}
              {renderField("tractionUsers", "input", undefined, { placeholder: "1,000 users" })}
              {renderField("tractionRevenue", "input", undefined, { placeholder: "$5,000 MRR" })}
              {renderField("tractionGrowth", "input", undefined, { placeholder: "20% MoM" })}
            </div>
          </section>

          {/* Step 3: Problem & Solution */}
          <section
            className={`bg-card rounded-2xl border border-border p-6 md:p-8 transition-all ${
              activeStep === 3 ? "ring-2 ring-primary/20" : ""
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-ocean-mid/10 text-ocean-mid flex items-center justify-center">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-xl text-foreground">Problem & Solution</h2>
                <p className="text-sm text-muted-foreground">What you're solving and how</p>
              </div>
            </div>

            <div className="space-y-4">
              {renderField("problemStatement", "textarea", undefined, { placeholder: "Describe the problem you're solving..." })}
              {renderField("solutionDescription", "textarea", undefined, { placeholder: "How does your product solve this problem?" })}
              {renderField("targetUsers", "textarea", undefined, { placeholder: "Who are your ideal customers?" })}
              {renderField("whyNow", "textarea", undefined, { placeholder: "Why is now the right time for this solution?" })}
              {renderField("differentiation", "textarea", undefined, { placeholder: "What makes you different from alternatives?" })}
              {renderField("competition", "textarea", undefined, { placeholder: "Who are your competitors?" })}
            </div>
          </section>

          {/* Step 4: Funding */}
          <section
            className={`bg-card rounded-2xl border border-border p-6 md:p-8 transition-all ${
              activeStep === 4 ? "ring-2 ring-primary/20" : ""
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-xl text-foreground">Funding & Pitch</h2>
                <p className="text-sm text-muted-foreground">Your ask and business model</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {renderField("askAmount", "input", undefined, { placeholder: "$500,000" })}
              {renderField("useOfFunds", "textarea", undefined, { placeholder: "How will you use the funding?" })}
              {renderField("businessModel", "textarea", undefined, { placeholder: "How do you make money?" })}
              {renderField("goToMarket", "textarea", undefined, { placeholder: "How will you acquire customers?" })}
              {renderField("pitchTone", "select", [
                { value: "professional", label: "Professional" },
                { value: "punchy", label: "Punchy" },
                { value: "story-driven", label: "Story-driven" },
              ], { placeholder: "Select pitch tone" })}
            </div>
          </section>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleSubmit}
            variant="coral"
            size="xl"
            disabled={saving}
            className="gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Pitch...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Generate Pitch + Save
              </>
            )}
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          All fields marked with * are required
        </p>
      </div>
    </div>
  );
}
