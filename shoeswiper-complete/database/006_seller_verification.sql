-- ============================================
-- SELLER VERIFICATION SCHEMA
-- Run this in Supabase SQL Editor after previous migrations
-- ============================================

-- ============================================
-- ENUMS
-- ============================================

-- Verification tier levels
DO $$ BEGIN
    CREATE TYPE verification_tier AS ENUM ('unverified', 'basic', 'verified', 'trusted');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Verification status
DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Document types for verification
DO $$ BEGIN
    CREATE TYPE document_type AS ENUM (
        'government_id',
        'proof_of_address',
        'business_license',
        'bank_statement',
        'social_media_verification'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- SELLER PROFILES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS seller_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

    -- Verification status
    verification_tier verification_tier DEFAULT 'unverified',
    verification_status verification_status DEFAULT 'pending',
    trust_score INTEGER DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),

    -- Verification dates
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_expires TIMESTAMP WITH TIME ZONE,
    last_review_at TIMESTAMP WITH TIME ZONE,

    -- Transaction metrics
    total_sales INTEGER DEFAULT 0,
    total_listings INTEGER DEFAULT 0,
    successful_transactions INTEGER DEFAULT 0,
    dispute_count INTEGER DEFAULT 0,
    average_rating NUMERIC(3, 2) DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
    review_count INTEGER DEFAULT 0,

    -- Account status
    is_active BOOLEAN DEFAULT true,
    is_suspended BOOLEAN DEFAULT false,
    is_banned BOOLEAN DEFAULT false,
    suspension_reason TEXT,
    suspended_at TIMESTAMP WITH TIME ZONE,
    suspended_by UUID REFERENCES auth.users(id),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- VERIFICATION DOCUMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS verification_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES seller_profiles(id) ON DELETE CASCADE,

    -- Document info
    document_type document_type NOT NULL,
    file_url TEXT NOT NULL,
    file_hash TEXT, -- SHA-256 hash for integrity verification

    -- Review status
    status verification_status DEFAULT 'pending',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewer_id UUID REFERENCES auth.users(id),
    reviewer_notes TEXT,

    -- Expiration (for IDs that expire)
    expires_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- VERIFICATION HISTORY TABLE
-- Track all verification changes for audit
-- ============================================

CREATE TABLE IF NOT EXISTS verification_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES seller_profiles(id) ON DELETE CASCADE,

    -- Change details
    previous_tier verification_tier,
    new_tier verification_tier,
    previous_status verification_status,
    new_status verification_status,

    -- Who made the change
    changed_by UUID REFERENCES auth.users(id),
    change_reason TEXT,

    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SELLER REVIEWS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS seller_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES seller_profiles(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_id UUID, -- Reference to transaction table when implemented

    -- Review content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT,

    -- Moderation
    is_visible BOOLEAN DEFAULT true,
    is_flagged BOOLEAN DEFAULT false,
    flagged_reason TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- One review per buyer per seller
    UNIQUE(seller_id, buyer_id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_seller_profiles_user_id ON seller_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_tier ON seller_profiles(verification_tier);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_trust_score ON seller_profiles(trust_score DESC);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_active ON seller_profiles(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_verification_documents_seller ON verification_documents(seller_id);
CREATE INDEX IF NOT EXISTS idx_verification_documents_status ON verification_documents(status);
CREATE INDEX IF NOT EXISTS idx_verification_documents_type ON verification_documents(document_type);

CREATE INDEX IF NOT EXISTS idx_verification_history_seller ON verification_history(seller_id);
CREATE INDEX IF NOT EXISTS idx_verification_history_created ON verification_history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_seller_reviews_seller ON seller_reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_reviews_buyer ON seller_reviews(buyer_id);
CREATE INDEX IF NOT EXISTS idx_seller_reviews_rating ON seller_reviews(rating);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_reviews ENABLE ROW LEVEL SECURITY;

-- Seller profiles: Users can read all, but only update their own
CREATE POLICY "Seller profiles are viewable by everyone"
ON seller_profiles FOR SELECT
USING (true);

CREATE POLICY "Users can create their own seller profile"
ON seller_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own seller profile"
ON seller_profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Verification documents: Only owner can see their documents
CREATE POLICY "Users can view their own verification documents"
ON verification_documents FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM seller_profiles
        WHERE seller_profiles.id = verification_documents.seller_id
        AND seller_profiles.user_id = auth.uid()
    )
);

CREATE POLICY "Users can submit their own verification documents"
ON verification_documents FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM seller_profiles
        WHERE seller_profiles.id = seller_id
        AND seller_profiles.user_id = auth.uid()
    )
);

-- Verification history: Only owner can see their history
CREATE POLICY "Users can view their own verification history"
ON verification_history FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM seller_profiles
        WHERE seller_profiles.id = verification_history.seller_id
        AND seller_profiles.user_id = auth.uid()
    )
);

-- Reviews: Everyone can read visible reviews
CREATE POLICY "Visible reviews are viewable by everyone"
ON seller_reviews FOR SELECT
USING (is_visible = true);

CREATE POLICY "Users can create reviews"
ON seller_reviews FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can update their own reviews"
ON seller_reviews FOR UPDATE
USING (auth.uid() = buyer_id)
WITH CHECK (auth.uid() = buyer_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update seller's average rating when review changes
CREATE OR REPLACE FUNCTION update_seller_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE seller_profiles
    SET
        average_rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM seller_reviews
            WHERE seller_id = COALESCE(NEW.seller_id, OLD.seller_id)
            AND is_visible = true
        ),
        review_count = (
            SELECT COUNT(*)
            FROM seller_reviews
            WHERE seller_id = COALESCE(NEW.seller_id, OLD.seller_id)
            AND is_visible = true
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.seller_id, OLD.seller_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for rating updates
DROP TRIGGER IF EXISTS trigger_update_seller_rating ON seller_reviews;
CREATE TRIGGER trigger_update_seller_rating
AFTER INSERT OR UPDATE OR DELETE ON seller_reviews
FOR EACH ROW
EXECUTE FUNCTION update_seller_rating();

-- Function to log verification changes
CREATE OR REPLACE FUNCTION log_verification_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.verification_tier IS DISTINCT FROM NEW.verification_tier
       OR OLD.verification_status IS DISTINCT FROM NEW.verification_status THEN
        INSERT INTO verification_history (
            seller_id,
            previous_tier,
            new_tier,
            previous_status,
            new_status
        ) VALUES (
            NEW.id,
            OLD.verification_tier,
            NEW.verification_tier,
            OLD.verification_status,
            NEW.verification_status
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for verification history
DROP TRIGGER IF EXISTS trigger_log_verification_change ON seller_profiles;
CREATE TRIGGER trigger_log_verification_change
AFTER UPDATE ON seller_profiles
FOR EACH ROW
EXECUTE FUNCTION log_verification_change();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_seller_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Timestamp triggers
DROP TRIGGER IF EXISTS trigger_update_seller_profiles_timestamp ON seller_profiles;
CREATE TRIGGER trigger_update_seller_profiles_timestamp
BEFORE UPDATE ON seller_profiles
FOR EACH ROW
EXECUTE FUNCTION update_seller_timestamp();

DROP TRIGGER IF EXISTS trigger_update_verification_documents_timestamp ON verification_documents;
CREATE TRIGGER trigger_update_verification_documents_timestamp
BEFORE UPDATE ON verification_documents
FOR EACH ROW
EXECUTE FUNCTION update_seller_timestamp();

-- ============================================
-- SAMPLE ADMIN POLICY (for review access)
-- Uncomment and modify for your admin setup
-- ============================================

-- CREATE POLICY "Admins can view all verification documents"
-- ON verification_documents FOR SELECT
-- USING (
--     EXISTS (
--         SELECT 1 FROM profiles
--         WHERE profiles.id = auth.uid()
--         AND profiles.email = 'dadsellsgadgets@gmail.com'
--     )
-- );

-- CREATE POLICY "Admins can update verification documents"
-- ON verification_documents FOR UPDATE
-- USING (
--     EXISTS (
--         SELECT 1 FROM profiles
--         WHERE profiles.id = auth.uid()
--         AND profiles.email = 'dadsellsgadgets@gmail.com'
--     )
-- );
