export interface SettingsAccount {
  user_id: string;
  email: string;
  phone_number: string;
  gender: string;
  date_of_birth: string;
  account_created_date: string;
  first_username: string;
  current_username: string;
  account_status: 'active' | 'restricted' | 'deactivated' | 'pending_deletion';
  is_premium: boolean;
  subscription_expiry_date: string | null;
  subscription_status: 'free' | 'pending' | 'active' | 'cancelled' | 'expired' | 'paused' | 'payment_issue' | 'failed';
  is_deactivated: boolean;
  deactivated_at: string | null;
  deletion_requested_at: string | null;
  deletion_scheduled_for: string | null;
  can_restore_until: string | null;
}

export interface SettingsPremium {
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

export interface SettingsSecurity {
  two_factor_enabled: boolean;
  two_factor_method: 'sms' | 'totp' | null;
  totp_secret_masked: string | null;
  sms_2fa_phone: string | null;
  login_alerts_enabled: boolean;
  unrecognized_device_alerts: boolean;
  password_changed_at: string | null;
  backup_codes_remaining: number;
}

export interface SettingsContentPreferences {
  sensitive_content_control: 'standard' | 'less' | 'more';
  hide_like_view_counts: boolean;
  mention_policy: 'everyone' | 'people_you_follow' | 'no_one';
  tag_policy: 'everyone' | 'people_you_follow' | 'no_one';
}

export interface SettingsStorySettings {
  auto_save_to_archive: boolean;
  save_to_phone_gallery: boolean;
}

export interface SettingsStorage {
  cache_size_mb: number;
  cellular_data_saver: boolean;
  photo_auto_download: 'wifi_only' | 'mobile_data';
  video_auto_download: 'wifi_only' | 'mobile_data';
}

export interface SettingsNotifications {
  pause_all_until: string | null;
  push_likes: boolean;
  push_comments: boolean;
  push_new_followers: boolean;
  push_direct_messages: boolean;
  push_calls: boolean;
  push_app_updates: boolean;
}

export interface ActiveSession {
  id: string;
  device_name: string;
  os: string;
  location: string;
  ip_address: string;
  last_active_at: string;
  current: boolean;
  recognized: boolean;
  is_active: boolean;
}

export interface SettingsArchiveItem {
  id: string;
  caption?: string;
  title?: string;
  archived_at: string;
}

export interface SettingsOverview {
  account: SettingsAccount;
  premium: SettingsPremium;
  security: SettingsSecurity;
  content_preferences: SettingsContentPreferences;
  story_settings: SettingsStorySettings;
  storage_settings: SettingsStorage;
  notification_settings: SettingsNotifications;
  sessions: ActiveSession[];
  archives: {
    posts: SettingsArchiveItem[];
    stories: SettingsArchiveItem[];
  };
  blocked_accounts: Array<{
    user_id: string;
    username: string;
    display_name: string;
    blocked_at: string;
  }>;
  muted_accounts: {
    posts: Array<{ user_id: string; username: string; display_name: string; mute_type: string; expires_at: string | null }>;
    stories: Array<{ user_id: string; username: string; display_name: string; mute_type: string; expires_at: string | null }>;
    chats: Array<{ user_id: string; username: string; display_name: string; mute_type: string; expires_at: string | null }>;
  };
  latest_export: {
    id: string;
    status: string;
    requested_at: string;
    download_url: string | null;
    expires_at: string | null;
    format: string;
  } | null;
}