-- ============================================
-- ESCROW PAYMENT SYSTEM SCHEMA
-- Run this in Supabase SQL Editor after previous migrations
-- ============================================

-- ============================================
-- ENUMS
-- ============================================

-- Escrow status
DO $$ BEGIN
    CREATE TYPE escrow_status AS ENUM (
        'pending_payment',
        'payment_held',
        'shipped',
        'delivered',
        'released',
        'disputed',
        'refunded',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Dispute reasons
DO $$ BEGIN
    CREATE TYPE dispute_reason AS ENUM (
        'item_not_received',
        'item_not_as_described',
        'item_damaged',
        'counterfeit',
        'wrong_item',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Dispute status
DO $$ BEGIN
    CREATE TYPE dispute_status AS ENUM (
        'open',
        'under_review',
        'resolved_buyer',
        'resolved_seller',
        'resolved_split'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- ESCROW TRANSACTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS escrow_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL UNIQUE, -- Reference to orders table when implemented

    -- Parties
    buyer_id UUID NOT NULL REFERENCES auth.users(id),
    seller_id UUID NOT NULL REFERENCES auth.users(id),

    -- Financial details (all amounts in cents)
    item_amount INTEGER NOT NULL CHECK (item_amount >= 0),
    shipping_amount INTEGER NOT NULL DEFAULT 0 CHECK (shipping_amount >= 0),
    platform_fee INTEGER NOT NULL DEFAULT 0 CHECK (platform_fee >= 0),
    total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
    seller_payout INTEGER NOT NULL CHECK (seller_payout >= 0),

    -- Status tracking
    status escrow_status NOT NULL DEFAULT 'pending_payment',
    escrow_days INTEGER NOT NULL DEFAULT 7 CHECK (escrow_days >= 0),
    escrow_expires_at TIMESTAMP WITH TIME ZONE,

    -- Stripe payment IDs
    stripe_payment_intent_id TEXT,
    stripe_transfer_id TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    released_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT valid_amounts CHECK (total_amount = item_amount + shipping_amount),
    CONSTRAINT valid_payout CHECK (seller_payout <= item_amount),
    CONSTRAINT different_parties CHECK (buyer_id != seller_id)
);

-- ============================================
-- ESCROW DISPUTES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS escrow_disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    escrow_id UUID NOT NULL REFERENCES escrow_transactions(id) ON DELETE RESTRICT,

    -- Dispute details
    opened_by UUID NOT NULL REFERENCES auth.users(id),
    reason dispute_reason NOT NULL,
    description TEXT NOT NULL,
    evidence_urls TEXT[] DEFAULT '{}',

    -- Status and resolution
    status dispute_status NOT NULL DEFAULT 'open',
    resolved_by UUID REFERENCES auth.users(id),
    resolution_notes TEXT,
    refund_amount INTEGER, -- Partial refund amount if split resolution

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,

    -- Ensure only one active dispute per escrow
    CONSTRAINT one_active_dispute UNIQUE (escrow_id)
);

-- ============================================
-- ESCROW HISTORY TABLE
-- Audit trail for status changes
-- ============================================

CREATE TABLE IF NOT EXISTS escrow_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    escrow_id UUID NOT NULL REFERENCES escrow_transactions(id) ON DELETE CASCADE,

    -- Change details
    previous_status escrow_status,
    new_status escrow_status NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    change_reason TEXT,

    -- Additional context
    metadata JSONB DEFAULT '{}',

    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PAYOUT SCHEDULE TABLE
-- Track scheduled payouts to sellers
-- ============================================

CREATE TABLE IF NOT EXISTS payout_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    escrow_id UUID NOT NULL REFERENCES escrow_transactions(id) ON DELETE RESTRICT,
    seller_id UUID NOT NULL REFERENCES auth.users(id),

    -- Payout details
    amount INTEGER NOT NULL CHECK (amount > 0),
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Status
    is_processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMP WITH TIME ZONE,
    stripe_transfer_id TEXT,
    error_message TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Escrow transactions indexes
CREATE INDEX IF NOT EXISTS idx_escrow_buyer ON escrow_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_escrow_seller ON escrow_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_escrow_status ON escrow_transactions(status);
CREATE INDEX IF NOT EXISTS idx_escrow_order ON escrow_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_escrow_expires ON escrow_transactions(escrow_expires_at)
    WHERE escrow_expires_at IS NOT NULL AND status = 'delivered';
CREATE INDEX IF NOT EXISTS idx_escrow_stripe_pi ON escrow_transactions(stripe_payment_intent_id)
    WHERE stripe_payment_intent_id IS NOT NULL;

-- Disputes indexes
CREATE INDEX IF NOT EXISTS idx_dispute_escrow ON escrow_disputes(escrow_id);
CREATE INDEX IF NOT EXISTS idx_dispute_status ON escrow_disputes(status);
CREATE INDEX IF NOT EXISTS idx_dispute_opened_by ON escrow_disputes(opened_by);

-- History indexes
CREATE INDEX IF NOT EXISTS idx_escrow_history_escrow ON escrow_history(escrow_id);
CREATE INDEX IF NOT EXISTS idx_escrow_history_created ON escrow_history(created_at DESC);

-- Payout schedule indexes
CREATE INDEX IF NOT EXISTS idx_payout_seller ON payout_schedule(seller_id);
CREATE INDEX IF NOT EXISTS idx_payout_scheduled ON payout_schedule(scheduled_for)
    WHERE is_processed = false;
CREATE INDEX IF NOT EXISTS idx_payout_escrow ON payout_schedule(escrow_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_schedule ENABLE ROW LEVEL SECURITY;

-- Escrow transactions: Participants can view their own transactions
CREATE POLICY "Users can view their escrow transactions"
ON escrow_transactions FOR SELECT
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Buyers can create escrow transactions
CREATE POLICY "Buyers can create escrow transactions"
ON escrow_transactions FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

-- Status updates restricted to appropriate parties (handled by functions)
-- Using service role for status updates in Edge Functions

-- Disputes: Participants can view disputes
CREATE POLICY "Users can view their disputes"
ON escrow_disputes FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM escrow_transactions
        WHERE escrow_transactions.id = escrow_disputes.escrow_id
        AND (escrow_transactions.buyer_id = auth.uid() OR escrow_transactions.seller_id = auth.uid())
    )
);

-- Buyers can create disputes
CREATE POLICY "Buyers can create disputes"
ON escrow_disputes FOR INSERT
WITH CHECK (
    auth.uid() = opened_by AND
    EXISTS (
        SELECT 1 FROM escrow_transactions
        WHERE escrow_transactions.id = escrow_id
        AND escrow_transactions.buyer_id = auth.uid()
    )
);

-- History: Participants can view history
CREATE POLICY "Users can view their escrow history"
ON escrow_history FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM escrow_transactions
        WHERE escrow_transactions.id = escrow_history.escrow_id
        AND (escrow_transactions.buyer_id = auth.uid() OR escrow_transactions.seller_id = auth.uid())
    )
);

-- Payout schedule: Sellers can view their payouts
CREATE POLICY "Sellers can view their payouts"
ON payout_schedule FOR SELECT
USING (auth.uid() = seller_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to log escrow status changes
CREATE OR REPLACE FUNCTION log_escrow_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO escrow_history (
            escrow_id,
            previous_status,
            new_status,
            metadata
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            jsonb_build_object(
                'stripe_payment_intent_id', NEW.stripe_payment_intent_id,
                'stripe_transfer_id', NEW.stripe_transfer_id
            )
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for status logging
DROP TRIGGER IF EXISTS trigger_log_escrow_status ON escrow_transactions;
CREATE TRIGGER trigger_log_escrow_status
AFTER UPDATE ON escrow_transactions
FOR EACH ROW
EXECUTE FUNCTION log_escrow_status_change();

-- Function to update escrow timestamps
CREATE OR REPLACE FUNCTION update_escrow_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();

    -- Set status-specific timestamps
    IF OLD.status != 'payment_held' AND NEW.status = 'payment_held' THEN
        NEW.paid_at = NOW();
    END IF;

    IF OLD.status != 'shipped' AND NEW.status = 'shipped' THEN
        NEW.shipped_at = NOW();
    END IF;

    IF OLD.status != 'delivered' AND NEW.status = 'delivered' THEN
        NEW.delivered_at = NOW();
        -- Set escrow expiration
        IF NEW.escrow_days > 0 THEN
            NEW.escrow_expires_at = NOW() + (NEW.escrow_days || ' days')::INTERVAL;
        END IF;
    END IF;

    IF OLD.status != 'released' AND NEW.status = 'released' THEN
        NEW.released_at = NOW();
    END IF;

    IF OLD.status != 'refunded' AND NEW.status = 'refunded' THEN
        NEW.refunded_at = NOW();
    END IF;

    IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
        NEW.cancelled_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for timestamp updates
DROP TRIGGER IF EXISTS trigger_update_escrow_timestamps ON escrow_transactions;
CREATE TRIGGER trigger_update_escrow_timestamps
BEFORE UPDATE ON escrow_transactions
FOR EACH ROW
EXECUTE FUNCTION update_escrow_timestamps();

-- Function to update dispute timestamps
CREATE OR REPLACE FUNCTION update_dispute_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();

    -- Set resolved timestamp when status changes to resolved
    IF OLD.status NOT IN ('resolved_buyer', 'resolved_seller', 'resolved_split')
       AND NEW.status IN ('resolved_buyer', 'resolved_seller', 'resolved_split') THEN
        NEW.resolved_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for dispute timestamp updates
DROP TRIGGER IF EXISTS trigger_update_dispute_timestamps ON escrow_disputes;
CREATE TRIGGER trigger_update_dispute_timestamps
BEFORE UPDATE ON escrow_disputes
FOR EACH ROW
EXECUTE FUNCTION update_dispute_timestamps();

-- Function to schedule payout when escrow is released
CREATE OR REPLACE FUNCTION schedule_seller_payout()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status != 'released' AND NEW.status = 'released' THEN
        INSERT INTO payout_schedule (
            escrow_id,
            seller_id,
            amount,
            scheduled_for
        ) VALUES (
            NEW.id,
            NEW.seller_id,
            NEW.seller_payout,
            NOW() -- Immediate payout, can be adjusted for batching
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for scheduling payouts
DROP TRIGGER IF EXISTS trigger_schedule_payout ON escrow_transactions;
CREATE TRIGGER trigger_schedule_payout
AFTER UPDATE ON escrow_transactions
FOR EACH ROW
EXECUTE FUNCTION schedule_seller_payout();

-- Function to get pending payouts for processing
CREATE OR REPLACE FUNCTION get_pending_payouts(batch_size INTEGER DEFAULT 100)
RETURNS TABLE (
    id UUID,
    escrow_id UUID,
    seller_id UUID,
    amount INTEGER,
    scheduled_for TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ps.id,
        ps.escrow_id,
        ps.seller_id,
        ps.amount,
        ps.scheduled_for
    FROM payout_schedule ps
    WHERE ps.is_processed = false
      AND ps.scheduled_for <= NOW()
    ORDER BY ps.scheduled_for ASC
    LIMIT batch_size
    FOR UPDATE SKIP LOCKED;
END;
$$ LANGUAGE plpgsql;

-- Function to check for expired escrows that should be auto-released
CREATE OR REPLACE FUNCTION get_expired_escrows()
RETURNS TABLE (
    id UUID,
    buyer_id UUID,
    seller_id UUID,
    seller_payout INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        et.id,
        et.buyer_id,
        et.seller_id,
        et.seller_payout
    FROM escrow_transactions et
    WHERE et.status = 'delivered'
      AND et.escrow_expires_at IS NOT NULL
      AND et.escrow_expires_at <= NOW()
    FOR UPDATE SKIP LOCKED;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ADMIN POLICIES (uncomment for production)
-- ============================================

-- -- Admin can view all escrow transactions
-- CREATE POLICY "Admins can view all escrow transactions"
-- ON escrow_transactions FOR SELECT
-- USING (
--     EXISTS (
--         SELECT 1 FROM profiles
--         WHERE profiles.id = auth.uid()
--         AND profiles.email = 'dadsellsgadgets@gmail.com'
--     )
-- );

-- -- Admin can update escrow transactions (for dispute resolution)
-- CREATE POLICY "Admins can update escrow transactions"
-- ON escrow_transactions FOR UPDATE
-- USING (
--     EXISTS (
--         SELECT 1 FROM profiles
--         WHERE profiles.id = auth.uid()
--         AND profiles.email = 'dadsellsgadgets@gmail.com'
--     )
-- );

-- -- Admin can resolve disputes
-- CREATE POLICY "Admins can update disputes"
-- ON escrow_disputes FOR UPDATE
-- USING (
--     EXISTS (
--         SELECT 1 FROM profiles
--         WHERE profiles.id = auth.uid()
--         AND profiles.email = 'dadsellsgadgets@gmail.com'
--     )
-- );
