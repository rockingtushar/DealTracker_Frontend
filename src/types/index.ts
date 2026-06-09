export interface Influencer {
  id: number
  name: string
  email: string
  instagram_handle: string
  youtube_handle?: string
  niche: string
  followers_count: number
  upi_id?: string
  instagram_followers?: number
  instagram_following?: number
  instagram_posts?: number
  instagram_bio?: string
  instagram_pic_url?: string
  instagram_verified?: boolean
  instagram_synced_at?: string
  bank_name?: string
  account_number?: string
  ifsc_code?: string
}

export type DealStatus =
  | 'negotiating'
  | 'confirmed'
  | 'content_sent'
  | 'revision_requested'
  | 'posted'
  | 'payment_pending'
  | 'completed'
  | 'cancelled'

export type Platform = 'instagram' | 'youtube' | 'both'

export interface Deal {
  id: number
  influencer_id: number
  brand_name: string
  contact_person?: string
  contact_email?: string
  contact_phone?: string
  platform: Platform
  deliverables: string
  amount: number
  deadline: string
  status: DealStatus
  notes?: string
  created_at: string
  updated_at?: string
}

export interface Payment {
  id: number
  deal_id: number
  influencer_id: number
  amount: number
  method: 'upi' | 'bank' | 'cash' | 'other'
  received_date: string
  notes?: string
  created_at: string
}

export interface Invoice {
  id: number
  deal_id: number
  influencer_id: number
  invoice_number: string
  pdf_path: string
  created_at: string
}

export interface MonthlyIncome {
  month: string
  amount: number
}

export interface TopBrand {
  brand_name: string
  total_amount: number
}

export interface DashboardData {
  total_earned_this_month: number
  total_earned_all_time: number
  active_deals_count: number
  pending_payment_amount: number
  pending_payment_count: number
  deadlines_this_week: Deal[]
  pending_payments: Deal[]
  recent_deals: Deal[]
  monthly_income: MonthlyIncome[]
  top_brands: TopBrand[]
}

export interface RateCard {
  per_reel_rate: number
  per_story_rate: number
  per_post_rate: number
  per_youtube_video_rate: number
  industry_average_reel: number
  industry_average_story: number
}

export interface AuthResponse {
  access_token: string
  influencer: Influencer
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}


export interface ReportsData {
  total_earned_all_time: number
  total_deals_completed: number
  avg_deal_value: number
  best_month: { month: string; amount: number }
  monthly_income: { month: string; amount: number }[]
  top_brands: {
    brand_name: string
    total_amount: number
    deals_count: number
  }[]
  platform_split: {
    instagram: number
    youtube: number
    both: number
  }
  status_breakdown: {
    completed: number
    active: number
    cancelled: number
  }
}