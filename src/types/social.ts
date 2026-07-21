export type MuteType = 'user' | 'posts' | 'stories';
export type MuteDuration = '8_hours' | '1_week' | 'always';
export type ReportReason = 'spam' | 'harassment' | 'inappropriate_content' | 'fraud';

export interface FollowRequest {
  id: string;
  requester_id: string;
  target_id: string;
  status: string;
  created_at: string;
  responded_at: string | null;
}

export interface MuteRecord {
  muter_id: string;
  muted_id: string;
  mute_type: MuteType;
  expires_at: string | null;
  duration: MuteDuration;
  created_at: string;
}

export interface RelationshipState {
  is_self: boolean;
  is_blocked: boolean;
  blocked_by_current_user: boolean;
  blocked_by_target_user: boolean;
  is_following: boolean;
  is_followed_by: boolean;
  outgoing_follow_request: FollowRequest | null;
  incoming_follow_request: FollowRequest | null;
  mutes: Record<MuteType, MuteRecord | null>;
}

export interface SocialUser {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_color: string;
  is_private: boolean;
  is_blocked_from_search: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
  followers_visible?: boolean;
  following_visible?: boolean;
  posts?: Array<{ id: string; caption: string; visibility: string }>;
  stories?: string[];
  relationship?: RelationshipState;
  access?: {
    can_view_full_profile: boolean;
    can_view_followers: boolean;
    can_view_following: boolean;
    can_view_posts: boolean;
    can_view_stories: boolean;
  };
}

export interface SocialOverview {
  me: SocialUser;
  pending_incoming: FollowRequest[];
  pending_outgoing: FollowRequest[];
  discover: SocialUser[];
  followers: SocialUser[];
  following: SocialUser[];
}

export interface ChatMessage {
  id: number;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  text: string;
  created_at: string;
  encrypted_payload?: string | null;
  encryption_nonce?: string | null;
  sender_ephemeral_public_key?: string | null;
  recipient_key_id?: string | null;
  encryption_algorithm?: string | null;
  is_zero_knowledge?: boolean;
  delivery_state?: 'queued' | 'sent' | 'failed';
}

export interface ChatSettings {
  user_id: string;
  chat_id: string;
  custom_wallpaper: string | null;
  custom_nickname: string;
  is_muted: boolean;
  mute_until: string | null;
  notification_sound_enabled: boolean;
  vibration_enabled: boolean;
  updated_at: string;
}

export interface SharedAsset {
  id: string;
  type: 'photo' | 'video' | 'doc';
  url: string;
  label: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  participants: string[];
  partner_user_id: string;
  partner: SocialUser;
  messages: ChatMessage[];
  is_unavailable: boolean;
  chat_settings: ChatSettings;
}

export interface ChatDetails {
  conversation_id: string;
  profile: SocialUser;
  shared_media: SharedAsset[];
  settings: ChatSettings;
  relationship: RelationshipState;
}

export interface ReportRecord {
  id: string;
  reporter_id: string;
  reported_id: string;
  reason: ReportReason;
  description: string;
  status: string;
  created_at: string;
}