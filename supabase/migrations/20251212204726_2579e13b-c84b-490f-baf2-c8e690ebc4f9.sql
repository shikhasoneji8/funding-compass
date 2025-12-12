-- Make ask_amount, use_of_funds, and business_model nullable
ALTER TABLE public.projects ALTER COLUMN ask_amount DROP NOT NULL;
ALTER TABLE public.projects ALTER COLUMN use_of_funds DROP NOT NULL;
ALTER TABLE public.projects ALTER COLUMN business_model DROP NOT NULL;

-- Set default values for these columns
ALTER TABLE public.projects ALTER COLUMN ask_amount SET DEFAULT '';
ALTER TABLE public.projects ALTER COLUMN use_of_funds SET DEFAULT '';
ALTER TABLE public.projects ALTER COLUMN business_model SET DEFAULT '';