-- SecureLens PostgreSQL Initial Database Schema Migration
-- Migration: 001_initial_schema.sql

-- Enable standard UUID generation if not already active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Mirror of Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Scans Lifecycle Tracking Table
CREATE TABLE IF NOT EXISTS scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    target TEXT NOT NULL,
    normalized_target TEXT,
    target_type VARCHAR(50) NOT NULL, -- 'url', 'domain', 'ip', 'brand_search'
    source VARCHAR(50) NOT NULL, -- 'web', 'extension', 'nrd_processor'
    status VARCHAR(50) NOT NULL DEFAULT 'queued', -- 'queued', 'scanning', 'completed', 'failed'
    risk_level VARCHAR(50) NOT NULL DEFAULT 'unknown', -- 'low', 'medium', 'high', 'critical', 'unknown'
    risk_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for querying scan history quickly by user and target
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_normalized_target ON scans(normalized_target);

-- 3. Evidence Telemetry Data Table
CREATE TABLE IF NOT EXISTS evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- 'ssl', 'dns', 'reputation', etc.
    signal VARCHAR(100) NOT NULL, -- 'hsts_missing', 'open_port', etc.
    value JSONB DEFAULT '{}'::jsonb,
    source VARCHAR(100) NOT NULL, -- 'security_engine', 'abuseipdb', etc.
    confidence NUMERIC(3, 2) DEFAULT 1.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_evidence_scan_id ON evidence(scan_id);

-- 4. Authoritative Forensic Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL UNIQUE REFERENCES scans(id) ON DELETE CASCADE,
    summary TEXT,
    findings JSONB DEFAULT '[]'::jsonb,
    infrastructure JSONB DEFAULT '{}'::jsonb,
    recommendation TEXT,
    timeline JSONB DEFAULT '[]'::jsonb,
    rulebook_version VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Suspicious Lookalike Candidates Alerts Table
CREATE TABLE IF NOT EXISTS lookalike_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_domain TEXT NOT NULL UNIQUE, -- Enforce UNIQUE constraint to prevent duplicate alert storms
    matched_brand VARCHAR(100) NOT NULL,
    similarity_score NUMERIC(5, 4) NOT NULL,
    risk_level VARCHAR(50) NOT NULL DEFAULT 'unknown',
    detection_type VARCHAR(50) NOT NULL, -- 'typosquatting', 'homoglyph', 'combosquatting'
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'resolved', 'dismissed'
    evidence_summary JSONB DEFAULT '{}'::jsonb,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Newly Registered Domain (NRD) Candidates Feed Ingestion Table
CREATE TABLE IF NOT EXISTS nrd_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain TEXT NOT NULL UNIQUE, -- Enforce UNIQUE constraint to prevent duplicate processing
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_analyzed BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_nrd_candidates_is_analyzed ON nrd_candidates(is_analyzed);
