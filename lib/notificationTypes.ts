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
  | "maintenance_resolved"
  | "lease_check_complete"
  | "move_in_report_shared"
  | "move_in_report_acknowledged";

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
