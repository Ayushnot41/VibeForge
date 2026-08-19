-- ============================================================
-- Migration 001: Enable Extensions
-- ============================================================
-- Enable the pgvector extension for storing and querying
-- high-dimensional vector embeddings (used for semantic search).
-- ============================================================

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;
