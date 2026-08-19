-- ============================================================
-- Migration 002: Create Tables
-- ============================================================

-- ----------------------------------------------------------
-- 1. Simulations table
-- ----------------------------------------------------------
CREATE TABLE public.simulations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  input_data  JSONB DEFAULT '{}'::jsonb,
  paths       JSONB DEFAULT '[]'::jsonb,
  action_plan JSONB DEFAULT '{}'::jsonb,
  media       JSONB DEFAULT '{}'::jsonb,
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookup by owner
CREATE INDEX idx_simulations_user_id ON public.simulations(user_id);

-- Auto-update the updated_at column on row modification
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_simulations_updated_at
  BEFORE UPDATE ON public.simulations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------
-- 2. Embeddings table
-- ----------------------------------------------------------
CREATE TABLE public.embeddings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  simulation_id UUID NOT NULL REFERENCES public.simulations(id) ON DELETE CASCADE,
  content       TEXT NOT NULL,
  embedding     vector(1536),
  metadata      JSONB DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- B-tree indexes for foreign key lookups
CREATE INDEX idx_embeddings_user_id       ON public.embeddings(user_id);
CREATE INDEX idx_embeddings_simulation_id ON public.embeddings(simulation_id);

-- HNSW index for fast approximate nearest-neighbor search
CREATE INDEX idx_embeddings_hnsw ON public.embeddings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- ----------------------------------------------------------
-- 3. Row Level Security
-- ----------------------------------------------------------

-- Simulations RLS
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own simulations"
  ON public.simulations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own simulations"
  ON public.simulations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own simulations"
  ON public.simulations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own simulations"
  ON public.simulations FOR DELETE
  USING (auth.uid() = user_id);

-- Embeddings RLS
ALTER TABLE public.embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own embeddings"
  ON public.embeddings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own embeddings"
  ON public.embeddings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own embeddings"
  ON public.embeddings FOR DELETE
  USING (auth.uid() = user_id);
