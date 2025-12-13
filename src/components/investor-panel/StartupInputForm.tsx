import { StartupProfile, PanelSettings, PanelMode, RiskTolerance } from '@/types/investorPanel';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface StartupInputFormProps {
  profile: StartupProfile;
  settings: PanelSettings;
  onProfileChange: (profile: StartupProfile) => void;
  onSettingsChange: (settings: PanelSettings) => void;
}

export function StartupInputForm({ 
  profile, 
  settings, 
  onProfileChange, 
  onSettingsChange 
}: StartupInputFormProps) {
  const updateProfile = (field: keyof StartupProfile, value: string) => {
    onProfileChange({ ...profile, [field]: value });
  };

  const updateSettings = (field: keyof PanelSettings, value: number | PanelMode | RiskTolerance) => {
    onSettingsChange({ ...settings, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Startup Details */}
      <Card>
        <CardHeader>
          <CardTitle>Startup Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startupName">Startup Name *</Label>
              <Input
                id="startupName"
                value={profile.startupName}
                onChange={(e) => updateProfile('startupName', e.target.value)}
                placeholder="e.g., Acme Corp"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fundraisingGoal">Fundraising Goal</Label>
              <Input
                id="fundraisingGoal"
                value={profile.fundraisingGoal}
                onChange={(e) => updateProfile('fundraisingGoal', e.target.value)}
                placeholder="e.g., $500K Seed Round"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="oneLiner">One-Liner *</Label>
            <Input
              id="oneLiner"
              value={profile.oneLiner}
              onChange={(e) => updateProfile('oneLiner', e.target.value)}
              placeholder="e.g., Uber for dog walking"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="problem">Problem *</Label>
              <Textarea
                id="problem"
                value={profile.problem}
                onChange={(e) => updateProfile('problem', e.target.value)}
                placeholder="What pain point are you solving?"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="solution">Solution *</Label>
              <Textarea
                id="solution"
                value={profile.solution}
                onChange={(e) => updateProfile('solution', e.target.value)}
                placeholder="How do you solve it?"
                rows={3}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetCustomer">Target Customer *</Label>
              <Textarea
                id="targetCustomer"
                value={profile.targetCustomer}
                onChange={(e) => updateProfile('targetCustomer', e.target.value)}
                placeholder="Who is your ideal customer?"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessModel">Business Model *</Label>
              <Textarea
                id="businessModel"
                value={profile.businessModel}
                onChange={(e) => updateProfile('businessModel', e.target.value)}
                placeholder="How do you make money?"
                rows={2}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="traction">Traction</Label>
              <Textarea
                id="traction"
                value={profile.traction}
                onChange={(e) => updateProfile('traction', e.target.value)}
                placeholder="Key metrics, users, revenue, growth..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team">Team</Label>
              <Textarea
                id="team"
                value={profile.team}
                onChange={(e) => updateProfile('team', e.target.value)}
                placeholder="Founders, key hires, relevant experience..."
                rows={2}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="moat">Moat / Differentiation</Label>
              <Textarea
                id="moat"
                value={profile.moat}
                onChange={(e) => updateProfile('moat', e.target.value)}
                placeholder="What makes you defensible?"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="competitors">Competitors</Label>
              <Textarea
                id="competitors"
                value={profile.competitors}
                onChange={(e) => updateProfile('competitors', e.target.value)}
                placeholder="Who else is in this space?"
                rows={2}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="extraNotes">Extra Notes</Label>
            <Textarea
              id="extraNotes"
              value={profile.extraNotes}
              onChange={(e) => updateProfile('extraNotes', e.target.value)}
              placeholder="Anything else the panel should know..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Panel Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Panel Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Number of Investors</Label>
              <span className="text-sm font-medium text-primary">{settings.agentCount}</span>
            </div>
            <Slider
              value={[settings.agentCount]}
              onValueChange={(value) => updateSettings('agentCount', value[0])}
              min={3}
              max={8}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>3 investors</span>
              <span>8 investors</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Panel Mode</Label>
              <Select
                value={settings.mode}
                onValueChange={(value: PanelMode) => updateSettings('mode', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fast">Fast Verdict</SelectItem>
                  <SelectItem value="deep">Deep Diligence</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {settings.mode === 'fast' 
                  ? 'Quick assessment with key insights' 
                  : 'Thorough analysis with detailed discussion'}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Risk Tolerance</Label>
              <Select
                value={settings.riskTolerance}
                onValueChange={(value: RiskTolerance) => updateSettings('riskTolerance', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {settings.riskTolerance === 'conservative' 
                  ? 'Focus on proven traction and lower risk' 
                  : settings.riskTolerance === 'balanced'
                  ? 'Balance between potential and proof'
                  : 'Emphasize big vision and high upside'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
