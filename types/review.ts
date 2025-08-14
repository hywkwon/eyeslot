export interface Review {
  id: string
  booking_id: string
  rating: number
  review_text?: string | null
  store_id?: string | null
  created_at: string
  updated_at: string
}

export interface CreateReviewRequest {
  booking_id: string
  rating: number
  review_text?: string
  store_id?: string
}

export interface ReviewResponse {
  message: string
  data?: Review | Review[] | null
  error?: string
}