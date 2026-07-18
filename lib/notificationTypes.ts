export type NotificationType =
  | "new_review"
  | "review_published"
  | "review_auto_published"
  | "pending_nudge"
  | "window_open"
  | "deposit_logged"
  | "deposit_returned"
  | "deposit_disputed"
  | "maintenance_logged"
  | "maintenance_acknowledged"
  | "maintenance_resolved";

export type Notification = {
  id:                string;
  user_id:           string;
  type:              NotificationType;
  title:             string;
  body:              string;
  read:              boolean;
  related_review_id: string | null;
  created_at:        string;
};
