import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Loader2, Search, ExternalLink, Trash2, Edit2 } from "lucide-react";

interface Investor {
  id: string;
  name: string;
  firm: string | null;
  email: string | null;
  linkedin: string | null;
  thesis: string | null;
  stage: string | null;
  check_size: string | null;
  status: string;
  follow_up_date: string | null;
  notes: string | null;
  created_at: string;
}

const statusOptions = [
  { value: "not_contacted", label: "Not Contacted", color: "bg-muted text-muted-foreground" },
  { value: "contacted", label: "Contacted", color: "bg-ocean-light text-primary" },
  { value: "replied", label: "Replied", color: "bg-accent/20 text-accent" },
  { value: "meeting", label: "Meeting", color: "bg-primary/20 text-primary" },
  { value: "passed", label: "Passed", color: "bg-destructive/20 text-destructive" },
  { value: "funded", label: "Funded", color: "bg-green-100 text-green-700" },
];

const emptyInvestor = {
  name: "",
  firm: "",
  email: "",
  linkedin: "",
  thesis: "",
  stage: "",
  check_size: "",
  status: "not_contacted",
  follow_up_date: "",
  notes: "",
};

export function InvestorCRM({ projectId }: { projectId: string }) {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyInvestor);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchInvestors();
  }, [projectId]);

  const fetchInvestors = async () => {
    try {
      const { data, error } = await supabase
        .from("investors")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvestors(data || []);
    } catch (error) {
      console.error("Error fetching investors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Investor name is required");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from("investors")
          .update({
            name: formData.name,
            firm: formData.firm || null,
            email: formData.email || null,
            linkedin: formData.linkedin || null,
            thesis: formData.thesis || null,
            stage: formData.stage || null,
            check_size: formData.check_size || null,
            status: formData.status,
            follow_up_date: formData.follow_up_date || null,
            notes: formData.notes || null,
          })
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Investor updated!");
      } else {
        const { error } = await supabase.from("investors").insert({
          project_id: projectId,
          name: formData.name,
          firm: formData.firm || null,
          email: formData.email || null,
          linkedin: formData.linkedin || null,
          thesis: formData.thesis || null,
          stage: formData.stage || null,
          check_size: formData.check_size || null,
          status: formData.status,
          follow_up_date: formData.follow_up_date || null,
          notes: formData.notes || null,
        });

        if (error) throw error;
        toast.success("Investor added!");
      }

      setDialogOpen(false);
      setFormData(emptyInvestor);
      setEditingId(null);
      fetchInvestors();
    } catch (error: any) {
      toast.error(error.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (investor: Investor) => {
    setEditingId(investor.id);
    setFormData({
      name: investor.name,
      firm: investor.firm || "",
      email: investor.email || "",
      linkedin: investor.linkedin || "",
      thesis: investor.thesis || "",
      stage: investor.stage || "",
      check_size: investor.check_size || "",
      status: investor.status,
      follow_up_date: investor.follow_up_date || "",
      notes: investor.notes || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this investor?")) return;

    try {
      const { error } = await supabase.from("investors").delete().eq("id", id);
      if (error) throw error;
      setInvestors(prev => prev.filter(i => i.id !== id));
      toast.success("Investor deleted");
    } catch (error: any) {
      toast.error("Failed to delete");
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("investors")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      setInvestors(prev =>
        prev.map(i => (i.id === id ? { ...i, status } : i))
      );
    } catch (error: any) {
      toast.error("Failed to update status");
    }
  };

  const filteredInvestors = investors.filter(i => {
    const matchesSearch =
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.firm?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-foreground">Investor CRM</h2>
          <p className="text-muted-foreground">
            Track your investor outreach and pipeline
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setFormData(emptyInvestor);
            setEditingId(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button variant="coral" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Investor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Investor" : "Add Investor"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="John Smith"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Firm</Label>
                  <Input
                    value={formData.firm}
                    onChange={(e) => setFormData(p => ({ ...p, firm: e.target.value }))}
                    placeholder="Sequoia"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                    placeholder="john@sequoia.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>LinkedIn</Label>
                <Input
                  value={formData.linkedin}
                  onChange={(e) => setFormData(p => ({ ...p, linkedin: e.target.value }))}
                  placeholder="linkedin.com/in/johnsmith"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stage</Label>
                  <Input
                    value={formData.stage}
                    onChange={(e) => setFormData(p => ({ ...p, stage: e.target.value }))}
                    placeholder="Pre-seed, Seed"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Check Size</Label>
                  <Input
                    value={formData.check_size}
                    onChange={(e) => setFormData(p => ({ ...p, check_size: e.target.value }))}
                    placeholder="$100k-$500k"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Investment Thesis</Label>
                <Input
                  value={formData.thesis}
                  onChange={(e) => setFormData(p => ({ ...p, thesis: e.target.value }))}
                  placeholder="B2B SaaS, Developer Tools"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData(p => ({ ...p, status: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Follow-up Date</Label>
                  <Input
                    type="date"
                    value={formData.follow_up_date}
                    onChange={(e) => setFormData(p => ({ ...p, follow_up_date: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Any notes about this investor..."
                />
              </div>
              <Button onClick={handleSave} className="w-full" disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editingId ? (
                  "Update Investor"
                ) : (
                  "Add Investor"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search investors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statusOptions.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Investor List */}
      {filteredInvestors.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8" />
          </div>
          <h3 className="font-display text-xl text-foreground mb-2">
            No investors yet
          </h3>
          <p className="text-muted-foreground mb-6">
            Start building your investor pipeline
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInvestors.map((investor) => {
            const statusOption = statusOptions.find(s => s.value === investor.status);
            return (
              <div
                key={investor.id}
                className="bg-card rounded-xl border border-border p-4 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-foreground">
                      {investor.name}
                    </h4>
                    {investor.firm && (
                      <span className="text-muted-foreground">@ {investor.firm}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    {investor.email && <span>{investor.email}</span>}
                    {investor.stage && <span>• {investor.stage}</span>}
                    {investor.check_size && <span>• {investor.check_size}</span>}
                  </div>
                  {investor.notes && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                      {investor.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={investor.status}
                    onValueChange={(v) => updateStatus(investor.id, v)}
                  >
                    <SelectTrigger className={`w-[140px] ${statusOption?.color}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {investor.linkedin && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={investor.linkedin} target="_blank" rel="noopener">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(investor)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(investor.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
