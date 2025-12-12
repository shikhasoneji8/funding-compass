-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  linkedin_url TEXT,
  location TEXT,
  background TEXT,
  raising_stage TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Startup fields
  startup_name TEXT NOT NULL,
  one_liner TEXT NOT NULL,
  category TEXT NOT NULL,
  stage TEXT NOT NULL,
  website TEXT,
  traction_users TEXT,
  traction_revenue TEXT,
  traction_growth TEXT,
  team_size TEXT,
  
  -- Problem/Solution fields
  problem_statement TEXT NOT NULL,
  solution_description TEXT NOT NULL,
  target_users TEXT NOT NULL,
  why_now TEXT,
  differentiation TEXT,
  competition TEXT,
  
  -- Funding fields
  ask_amount TEXT NOT NULL,
  use_of_funds TEXT NOT NULL,
  business_model TEXT NOT NULL,
  go_to_market TEXT,
  pitch_tone TEXT DEFAULT 'professional',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pitch_assets table
CREATE TABLE public.pitch_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create investors table
CREATE TABLE public.investors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  firm TEXT,
  email TEXT,
  linkedin TEXT,
  thesis TEXT,
  stage TEXT,
  check_size TEXT,
  status TEXT DEFAULT 'not_contacted',
  follow_up_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitch_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investors ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- Pitch assets policies (via project ownership)
CREATE POLICY "Users can view own pitch assets" ON public.pitch_assets
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = pitch_assets.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "Users can insert own pitch assets" ON public.pitch_assets
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = pitch_assets.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "Users can update own pitch assets" ON public.pitch_assets
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = pitch_assets.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "Users can delete own pitch assets" ON public.pitch_assets
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = pitch_assets.project_id AND projects.user_id = auth.uid())
  );

-- Investors policies (via project ownership)
CREATE POLICY "Users can view own investors" ON public.investors
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = investors.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "Users can insert own investors" ON public.investors
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = investors.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "Users can update own investors" ON public.investors
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = investors.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "Users can delete own investors" ON public.investors
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = investors.project_id AND projects.user_id = auth.uid())
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pitch_assets_updated_at
  BEFORE UPDATE ON public.pitch_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_investors_updated_at
  BEFORE UPDATE ON public.investors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();