export type UserRole = "tenant" | "landlord" | "agency";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id">>;
      };
      leases: {
        Row: Lease;
        Insert: Omit<Lease, "id" | "created_at">;
        Update: Partial<Omit<Lease, "id">>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, "id" | "created_at">;
        Update: Partial<Omit<Review, "id">>;
      };
    };
    Views: {
      reputation_scores: {
        Row: ReputationScore;
      };
    };
  };
};

export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  suburb: string | null;
  city: string | null;
  id_number: string | null;
  verified: boolean;
  avatar_url: string | null;
  bio: string | null;
  email: string | null;
  is_guest: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type Lease = {
  id: string;
  landlord_id: string;
  tenant_id: string;
  property_address: string;
  suburb: string | null;
  start_date: string;
  end_date: string | null;
  document_url: string | null;
  verified: boolean;
  created_at: string;
};

export type Review = {
  id: string;
  reviewer_id: string;
  reviewee_id: string | null;
  lease_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  document_url: string | null;
  overall: number;
  communication: number;
  fairness: number;
  maintenance: number | null;
  deposit_handling: number | null;
  payment_history: number | null;
  property_care: number | null;
  professionalism: number | null;
  transparency: number | null;
  value_for_money: number | null;
  responsiveness: number | null;
  paperwork_quality: number | null;
  privacy_boundaries: number | null;
  would_recommend: "yes" | "no" | "maybe" | null;
  anonymous: boolean;
  body: string;
  reply: string | null;
  created_at: string;
};

export type ReputationScore = {
  profile_id: string;
  overall: number;
  communication: number;
  maintenance: number | null;
  deposit_handling: number | null;
  fairness: number;
  payment_history: number | null;
  property_care: number | null;
  review_count: number;
};

export type ReviewWithReviewer = Review & {
  reviewer: Pick<Profile, "id" | "full_name" | "avatar_url" | "suburb">;
  lease: Pick<Lease, "property_address" | "suburb" | "start_date" | "end_date">;
};

export type ProfileWithScore = Profile & {
  reputation_scores: ReputationScore | null;
};
