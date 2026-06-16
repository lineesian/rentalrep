export type UserRole = "tenant" | "landlord" | "agency" | "agent";

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
      properties: {
        Row: Property;
        Insert: Omit<Property, "id" | "created_at">;
        Update: Partial<Omit<Property, "id">>;
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
  landlord_id: string | null;
  tenant_id: string;
  property_address: string;
  suburb: string | null;
  start_date: string;
  end_date: string | null;
  document_url: string | null;
  verified: boolean;
  created_at: string;
};

export type Property = {
  id: string;
  address: string;
  normalized_address: string;
  suburb: string | null;
  city: string | null;
  created_at: string;
};

export type Review = {
  id: string;
  reviewer_id: string;
  reviewee_id: string | null;
  lease_id: string | null;
  property_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  document_url: string | null;
  overall: number;
  // Shared
  communication: number;
  fairness: number;
  // Landlord review categories
  maintenance: number | null;
  deposit_handling: number | null;
  privacy_boundaries: number | null;
  // Tenant review categories
  payment_history: number | null;
  property_care: number | null;
  compliance_with_lease: number | null;
  vacating_conduct: number | null;
  neighbour_relations: number | null;
  // Agency / agent review categories
  professionalism: number | null;
  transparency: number | null;
  value_for_money: number | null;
  responsiveness: number | null;
  paperwork_quality: number | null;
  problem_resolution: number | null;
  // Property review categories
  condition_on_movein: number | null;
  safety_security: number | null;
  noise_levels: number | null;
  location_amenities: number | null;
  // Meta
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
  reviewer: Pick<Profile, "id" | "full_name" | "avatar_url" | "suburb"> | null;
  lease: Pick<Lease, "property_address" | "suburb" | "start_date" | "end_date"> | null;
};

export type ProfileWithScore = Profile & {
  reputation_scores: ReputationScore | null;
};
