export type NotificationType =
  | "new_review"
  | "review_published"
  | "review_auto_published"
  | "pending_nudge"
  | "window_open";

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
