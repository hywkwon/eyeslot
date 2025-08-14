-- Add store_id column to reviews table for better management

-- Add store_id column
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS store_id TEXT;

-- Create index for store_id for faster queries by store
CREATE INDEX IF NOT EXISTS idx_reviews_store_id ON reviews(store_id);

-- Create composite index for store_id and rating for analytics
CREATE INDEX IF NOT EXISTS idx_reviews_store_rating ON reviews(store_id, rating);

-- Add comment to the new column
COMMENT ON COLUMN reviews.store_id IS 'Store identifier where the service was provided (e.g., viewraum, lacitpo, etc.)';

-- Update existing reviews with store_id from bookings table
-- This will populate store_id for existing reviews by joining with bookings
UPDATE reviews 
SET store_id = b.store_id 
FROM bookings b 
WHERE reviews.booking_id = b.id::text 
AND reviews.store_id IS NULL;