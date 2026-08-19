-- ============================================================
-- Migration 003: Match Embeddings Function
-- ============================================================
-- Performs cosine similarity search against the embeddings table.
-- Returns the top `match_count` rows whose similarity exceeds
-- `match_threshold`, scoped to the calling user's data.
-- ============================================================

CREATE OR REPLACE FUNCTION public.match_embeddings(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.78,
  match_count     INT   DEFAULT 10,
  filter_user_id  UUID  DEFAULT NULL
)
RETURNS TABLE (
  id            UUID,
  simulation_id UUID,
  content       TEXT,
  metadata      JSONB,
  similarity    FLOAT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    e.id,
    e.simulation_id,
    e.content,
    e.metadata,
    1 - (e.embedding <=> query_embedding) AS similarity
  FROM public.embeddings e
  WHERE
    (filter_user_id IS NULL OR e.user_id = filter_user_id)
    AND 1 - (e.embedding <=> query_embedding) > match_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
$$;
