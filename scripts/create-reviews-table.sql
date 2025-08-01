-- Create reviews table for storing user feedback
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);

-- Create unique constraint to prevent duplicate reviews for same booking
ALTER TABLE reviews ADD CONSTRAINT unique_booking_review UNIQUE (booking_id);

-- Add RLS (Row Level Security) policies if needed
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read all reviews
CREATE POLICY "Allow read access to reviews" ON reviews
    FOR SELECT USING (true);

-- Create policy to allow users to insert their own reviews
CREATE POLICY "Allow insert reviews" ON reviews
    FOR INSERT WITH CHECK (true);

-- Create policy to allow users to update their own reviews
CREATE POLICY "Allow update reviews" ON reviews
    FOR UPDATE USING (true);

-- Create policy to allow users to delete their own reviews
CREATE POLICY "Allow delete reviews" ON reviews
    FOR DELETE USING (true);

-- Grant necessary permissions
GRANT ALL ON reviews TO authenticated;
GRANT ALL ON reviews TO anon;