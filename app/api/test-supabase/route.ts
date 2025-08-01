import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Supabase connection...')
    console.log('Supabase URL:', supabaseUrl)
    console.log('Supabase Key exists:', !!supabaseKey)
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Test connection by checking if reviews table exists
    const { data, error } = await supabase
      .from('reviews')
      .select('count', { count: 'exact', head: true })
      .limit(1)
    
    if (error) {
      console.error('Supabase connection test failed:', error)
      return NextResponse.json({
        success: false,
        message: 'Supabase connection failed',
        error: error.message,
        details: error
      }, { status: 500 })
    }
    
    console.log('Supabase connection successful')
    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      reviewsTableExists: true,
      count: data
    })
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({
      success: false,
      message: 'Unexpected error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}