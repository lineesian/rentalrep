import Stripe from "stripe";

// SERVER-SIDE ONLY — never import in client components.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});
