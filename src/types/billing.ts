export type PurchaseResultStatus = 'success' | 'pending' | 'cancelled' | 'failed';

export interface BillingSubscriptionSummary {
  user_id: string;
  is_premium: boolean;
  product_id: string;
  subscription_product_id: string | null;
  subscription_purchase_token: string | null;
  subscription_expiry_date: string | null;
  subscription_status: 'free' | 'pending' | 'active' | 'cancelled' | 'expired' | 'paused' | 'payment_issue' | 'failed';
  renews_at: string | null;
  cancel_at_period_end: boolean;
  last_verified_at: string | null;
  latest_order_id: string | null;
  manage_subscription_url: string;
}

export interface PurchaseResult {
  status: PurchaseResultStatus;
  productId: string;
  purchaseToken?: string;
  orderId?: string;
  message?: string;
}

export interface ProductListing {
  productId: string;
  title: string;
  description: string;
  price: string;
  billingPeriod: string;
}