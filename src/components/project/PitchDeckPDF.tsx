import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, FileDown, Eye } from "lucide-react";
import jsPDF from "jspdf";

interface Project {
  startup_name: string;
  one_liner: string;
  category: string;
  stage: string;
  problem_statement: string;
  solution_description: string;
  target_users: string;
  why_now: string | null;
  differentiation: string | null;
  traction_users: string | null;
  traction_revenue: string | null;
  traction_growth: string | null;
  ask_amount: string;
  use_of_funds: string;
  business_model: string;
}

interface PitchAsset {
  asset_type: string;
  content: string;
}

interface PitchDeckPDFProps {
  project: Project;
  assets: PitchAsset[];
}

export function PitchDeckPDF({ project, assets }: PitchDeckPDFProps) {
  const [generating, setGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const getAssetContent = (type: string) => {
    return assets.find(a => a.asset_type === type)?.content || "";
  };

  const slides = [
    {
      title: project.startup_name,
      subtitle: getAssetContent("tagline") || project.one_liner,
      type: "title",
      color: "#1a365d"
    },
    {
      title: "The Problem",
      content: project.problem_statement,
      type: "content",
      color: "#dc2626"
    },
    {
      title: "Our Solution",
      content: project.solution_description,
      bullets: project.differentiation ? [project.differentiation] : [],
      type: "content",
      color: "#16a34a"
    },
    {
      title: "Market & Traction",
      content: `Target: ${project.target_users}`,
      bullets: [
        project.traction_users ? `Users: ${project.traction_users}` : null,
        project.traction_revenue ? `Revenue: ${project.traction_revenue}` : null,
        project.traction_growth ? `Growth: ${project.traction_growth}` : null,
        project.why_now || null,
      ].filter(Boolean) as string[],
      type: "content",
      color: "#7c3aed"
    },
    {
      title: "Business Model",
      content: project.business_model,
      type: "content",
      color: "#0891b2"
    },
    {
      title: "The Ask",
      content: `Raising: ${project.ask_amount}`,
      bullets: project.use_of_funds.split(/[,\n]/).map(s => s.trim()).filter(Boolean),
      type: "ask",
      color: "#f97316"
    }
  ];

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [1280, 720]
      });

      const pageWidth = 1280;
      const pageHeight = 720;

      slides.forEach((slide, index) => {
        if (index > 0) {
          pdf.addPage();
        }

        // Background gradient effect (simplified as solid color for PDF)
        pdf.setFillColor(26, 32, 44); // Dark navy background
        pdf.rect(0, 0, pageWidth, pageHeight, "F");

        // Accent bar at top
        pdf.setFillColor(slide.color);
        pdf.rect(0, 0, pageWidth, 8, "F");

        // Slide number
        pdf.setTextColor(150, 150, 150);
        pdf.setFontSize(14);
        pdf.text(`${index + 1} / ${slides.length}`, pageWidth - 60, pageHeight - 30);

        // Company name in corner (except title slide)
        if (slide.type !== "title") {
          pdf.setTextColor(100, 100, 100);
          pdf.setFontSize(12);
          pdf.text(project.startup_name, 50, 50);
        }

        if (slide.type === "title") {
          // Title slide
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(72);
          pdf.setFont("helvetica", "bold");
          const titleWidth = pdf.getTextWidth(slide.title);
          pdf.text(slide.title, (pageWidth - titleWidth) / 2, pageHeight / 2 - 40);

          pdf.setFontSize(28);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(200, 200, 200);
          const subtitleLines = pdf.splitTextToSize(slide.subtitle || "", pageWidth - 200);
          const subtitleWidth = pdf.getTextWidth(subtitleLines[0] || "");
          pdf.text(subtitleLines, (pageWidth - subtitleWidth) / 2, pageHeight / 2 + 40);

          // Category & Stage badges
          pdf.setFillColor(slide.color);
          pdf.roundedRect(pageWidth / 2 - 120, pageHeight / 2 + 100, 100, 30, 5, 5, "F");
          pdf.roundedRect(pageWidth / 2 + 20, pageHeight / 2 + 100, 100, 30, 5, 5, "F");
          pdf.setFontSize(14);
          pdf.setTextColor(255, 255, 255);
          pdf.text(project.category, pageWidth / 2 - 70, pageHeight / 2 + 120, { align: "center" });
          pdf.text(project.stage, pageWidth / 2 + 70, pageHeight / 2 + 120, { align: "center" });

        } else {
          // Content slides
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(48);
          pdf.setFont("helvetica", "bold");
          pdf.text(slide.title, 80, 120);

          // Accent line under title
          pdf.setFillColor(slide.color);
          pdf.rect(80, 140, 100, 4, "F");

          // Content
          pdf.setFontSize(24);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(220, 220, 220);
          
          const contentLines = pdf.splitTextToSize(slide.content || "", pageWidth - 200);
          pdf.text(contentLines, 80, 200);

          // Bullets
          if (slide.bullets && slide.bullets.length > 0) {
            let bulletY = 200 + (contentLines.length * 30) + 40;
            pdf.setFontSize(20);
            slide.bullets.forEach((bullet) => {
              pdf.setFillColor(slide.color);
              pdf.circle(90, bulletY - 5, 5, "F");
              pdf.setTextColor(180, 180, 180);
              const bulletLines = pdf.splitTextToSize(bullet, pageWidth - 240);
              pdf.text(bulletLines, 110, bulletY);
              bulletY += bulletLines.length * 28 + 15;
            });
          }

          // Special styling for Ask slide
          if (slide.type === "ask") {
            pdf.setFillColor(slide.color);
            pdf.roundedRect(pageWidth - 400, 100, 320, 80, 10, 10, "F");
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(32);
            pdf.setFont("helvetica", "bold");
            pdf.text(project.ask_amount, pageWidth - 240, 150, { align: "center" });
          }
        }
      });

      pdf.save(`${project.startup_name.toLowerCase().replace(/\s+/g, "-")}-pitch-deck.pdf`);
      toast.success("Pitch deck PDF downloaded!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl text-foreground">Visual Pitch Deck</h3>
          <p className="text-sm text-muted-foreground">6-slide investor deck with professional design</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? "Hide Preview" : "Preview"}
          </Button>
          <Button variant="coral" size="sm" onClick={generatePDF} disabled={generating}>
            {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileDown className="w-4 h-4 mr-2" />}
            Download PDF
          </Button>
        </div>
      </div>

      {previewMode && (
        <div className="space-y-4">
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className="rounded-xl overflow-hidden border border-border"
              style={{ aspectRatio: "16/9" }}
            >
              <div
                className="w-full h-full p-8 flex flex-col justify-center relative"
                style={{ backgroundColor: "#1a202c" }}
              >
                {/* Accent bar */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: slide.color }}
                />
                
                {/* Slide number */}
                <span className="absolute bottom-4 right-6 text-sm text-muted-foreground">
                  {idx + 1} / {slides.length}
                </span>

                {slide.type === "title" ? (
                  <div className="text-center">
                    <h2 className="text-4xl md:text-5xl font-display text-white mb-4">{slide.title}</h2>
                    <p className="text-lg md:text-xl text-gray-300">{slide.subtitle}</p>
                    <div className="flex items-center justify-center gap-2 mt-6">
                      <span className="px-3 py-1 rounded-full text-sm text-white" style={{ backgroundColor: slide.color }}>
                        {project.category}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm text-white" style={{ backgroundColor: slide.color }}>
                        {project.stage}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-3xl">
                    {/* Company name */}
                    <p className="text-sm text-gray-500 mb-4">{project.startup_name}</p>
                    
                    <h3 className="text-3xl font-display text-white mb-2">{slide.title}</h3>
                    <div className="w-16 h-1 mb-6" style={{ backgroundColor: slide.color }} />
                    
                    <p className="text-lg text-gray-200 mb-4">{slide.content}</p>
                    
                    {slide.bullets && slide.bullets.length > 0 && (
                      <ul className="space-y-2">
                        {slide.bullets.map((bullet, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-300">
                            <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: slide.color }} />
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    )}

                    {slide.type === "ask" && (
                      <div 
                        className="absolute top-8 right-8 px-8 py-4 rounded-xl text-white font-display text-2xl"
                        style={{ backgroundColor: slide.color }}
                      >
                        {project.ask_amount}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
