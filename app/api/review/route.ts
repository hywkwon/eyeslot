import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    console.log('Review API: Starting POST request')
    const requestData = await request.json()
    console.log('Review API: Request data:', requestData)
    
    const { booking_id, rating, review_text, store_id } = requestData

    // Validation
    if (!booking_id || !rating || rating < 1 || rating > 5) {
      console.log('Review API: Validation failed', { booking_id, rating, review_text })
      return NextResponse.json(
        { message: 'Missing required fields or invalid rating' },
        { status: 400 }
      )
    }

    console.log('Review API: Checking for existing review')
    // Check if review already exists
    const { data: existingReview, error: checkError } = await supabase
      .from('reviews')
      .select('id')
      .eq('booking_id', booking_id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Review API: Error checking existing review:', checkError)
      return NextResponse.json(
        { message: 'Database error while checking existing review', error: checkError.message },
        { status: 500 }
      )
    }

    if (existingReview) {
      console.log('Review API: Review already exists for booking:', booking_id)
      return NextResponse.json(
        { message: 'Review already exists for this booking' },
        { status: 400 }
      )
    }

    console.log('Review API: Inserting new review')
    // Insert review
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        booking_id,
        rating,
        review_text: review_text || null,
        store_id: store_id || null,
        created_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('Review API: Supabase insert error:', error)
      return NextResponse.json(
        { message: 'Failed to save review', error: error.message, details: error },
        { status: 500 }
      )
    }

    console.log('Review API: Review saved successfully:', data)
    return NextResponse.json(
      { message: 'Review saved successfully', data },
      { status: 201 }
    )
  } catch (error) {
    console.error('Review API: Unexpected error:', error)
    return NextResponse.json(
      { message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('Review API: Starting PUT request')
    const requestData = await request.json()
    console.log('Review API: Request data:', requestData)
    
    const { booking_id, rating, review_text, store_id } = requestData

    // Validation
    if (!booking_id || !rating || rating < 1 || rating > 5) {
      console.log('Review API: Validation failed', { booking_id, rating, review_text })
      return NextResponse.json(
        { message: 'Missing required fields or invalid rating' },
        { status: 400 }
      )
    }

    console.log('Review API: Updating existing review')
    // Update existing review
    const { data, error } = await supabase
      .from('reviews')
      .update({
        rating,
        review_text: review_text || '',
        store_id: store_id || null,
        updated_at: new Date().toISOString()
      })
      .eq('booking_id', booking_id)
      .select()
      .single()

    if (error) {
      console.error('Review API: Error updating review:', error)
      return NextResponse.json(
        { message: 'Failed to update review', error: error.message },
        { status: 500 }
      )
    }

    console.log('Review API: Review updated successfully:', data)
    return NextResponse.json(
      { 
        message: 'Review updated successfully', 
        data: data 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Review API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('booking_id')
    const storeId = searchParams.get('store_id')

    if (!bookingId && !storeId) {
      return NextResponse.json(
        { message: 'Either booking_id or store_id is required' },
        { status: 400 }
      )
    }

    let query = supabase.from('reviews').select('*')
    
    if (bookingId) {
      query = query.eq('booking_id', bookingId).single()
    } else if (storeId) {
      query = query.eq('store_id', storeId).order('created_at', { ascending: false })
    }

    const { data, error } = await query

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Supabase error:', error)
      return NextResponse.json(
        { message: 'Failed to fetch review' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { data: data || null },
      { status: 200 }
    )
  } catch (error) {
    console.error('Review fetch API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}