-- SecureLens Row-Level Security (RLS) policies
-- Migration: 002_row_level_security.sql

-- Enable RLS across all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE lookalike_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE nrd_candidates ENABLE ROW LEVEL SECURITY;

--------------------------------------------------------------------------------
-- 1. Users Table Policies
--------------------------------------------------------------------------------

-- Users can view their own profile details
CREATE POLICY select_own_user ON users
    FOR SELECT
    USING (id = auth.uid());

-- Users can update their own profile details
CREATE POLICY update_own_user ON users
    FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

--------------------------------------------------------------------------------
-- 2. Scans Table Policies
--------------------------------------------------------------------------------

-- Authenticated users can view their own scans.
-- Anyone can view scans with no owner (public/guest scans via direct lookup).
CREATE POLICY select_scans ON scans
    FOR SELECT
    USING (user_id = auth.uid() OR user_id IS NULL);

-- Anyone can submit/insert scans.
-- Checks that they don't insert scans claiming to belong to another user.
CREATE POLICY insert_scans ON scans
    FOR INSERT
    WITH CHECK (user_id IS NULL OR user_id = auth.uid());

--------------------------------------------------------------------------------
-- 3. Evidence Table Policies
--------------------------------------------------------------------------------

-- Users can view evidence logs if the parent scan is accessible by them
CREATE POLICY select_evidence ON evidence
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM scans
            WHERE scans.id = evidence.scan_id
              AND (scans.user_id = auth.uid() OR scans.user_id IS NULL)
        )
    );

-- Evidence can only be created by the scan owner or service role
CREATE POLICY insert_evidence ON evidence
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM scans
            WHERE scans.id = evidence.scan_id
              AND (scans.user_id = auth.uid() OR scans.user_id IS NULL)
        )
    );

--------------------------------------------------------------------------------
-- 4. Reports Table Policies
--------------------------------------------------------------------------------

-- Users can view reports if the parent scan is accessible by them
CREATE POLICY select_reports ON reports
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM scans
            WHERE scans.id = reports.scan_id
              AND (scans.user_id = auth.uid() OR scans.user_id IS NULL)
        )
    );

-- Reports can only be created by the scan owner or service role
CREATE POLICY insert_reports ON reports
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM scans
            WHERE scans.id = reports.scan_id
              AND (scans.user_id = auth.uid() OR scans.user_id IS NULL)
        )
    );

--------------------------------------------------------------------------------
-- 5. Lookalike Alerts Policies
--------------------------------------------------------------------------------

-- Anyone (public or authenticated) can view global lookalike domain threat feeds
CREATE POLICY select_lookalike_alerts ON lookalike_alerts
    FOR SELECT
    USING (true);

-- Insert/Update/Delete privileges are strictly withheld from client API connections
-- Only the service_role bypasses RLS on the backend to write detections

--------------------------------------------------------------------------------
-- 6. NRD Candidates Policies
--------------------------------------------------------------------------------

-- Anyone can query the Newly Registered Domains queue
CREATE POLICY select_nrd_candidates ON nrd_candidates
    FOR SELECT
    USING (true);

-- Insert/Update/Delete privileges are strictly withheld from client API connections
-- Only the service_role bypasses RLS on the backend to ingest feeds
