-- Add trial and account status fields to merchants
ALTER TABLE merchants
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS account_status text not null default 'trial' check (account_status in ('trial','active','inactive'));

-- Set trial_ends_at for any existing merchants who don't have it
UPDATE merchants SET trial_ends_at = created_at + interval '30 days' WHERE trial_ends_at IS NULL;
