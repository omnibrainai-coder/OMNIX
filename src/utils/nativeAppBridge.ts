export type LaunchPayload = {
  targetScreen?: 'home' | 'chat' | 'profile' | 'settings';
  conversationId?: string;
  profileId?: string;
  notificationType?: string;
};

declare global {
  interface Window {
    AndroidAppBridge?: {
      getLaunchPayload?: () => string;
      clearLaunchPayload?: () => void;
      getDevicePushToken?: () => string;
      clearDevicePushToken?: () => void;
      requestNotificationPermission?: () => void;
      openExternalUrl?: (url: string) => void;
    };
    AndroidBiometricBridge?: {
      canAuthenticateBiometrics?: () => boolean;
      authenticateBiometric?: (title: string, subtitle: string) => string;
    };
  }
}

function parsePayload(raw: string | null | undefined): LaunchPayload | null {
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as LaunchPayload;
  } catch {
    return null;
  }
}

export function consumeNativeLaunchPayload(): LaunchPayload | null {
  const bridgePayload = parsePayload(window.AndroidAppBridge?.getLaunchPayload?.());
  if (bridgePayload) {
    window.AndroidAppBridge?.clearLaunchPayload?.();
    return bridgePayload;
  }

  const url = new URL(window.location.href);
  const targetScreen = url.searchParams.get('targetScreen');
  const conversationId = url.searchParams.get('conversationId');
  const profileId = url.searchParams.get('profileId');
  if (!targetScreen && !conversationId && !profileId) {
    return null;
  }
  return {
    targetScreen: (targetScreen as LaunchPayload['targetScreen']) ?? undefined,
    conversationId: conversationId ?? undefined,
    profileId: profileId ?? undefined,
    notificationType: url.searchParams.get('notificationType') ?? undefined,
  };
}

export function consumeDevicePushToken(): string | null {
  const token = window.AndroidAppBridge?.getDevicePushToken?.();
  if (token) {
    window.AndroidAppBridge?.clearDevicePushToken?.();
    return token;
  }
  return null;
}

export function requestNativeNotificationPermission(): void {
  window.AndroidAppBridge?.requestNotificationPermission?.();
}

export function canUseNativeBiometrics(): boolean {
  return Boolean(window.AndroidBiometricBridge?.canAuthenticateBiometrics?.());
}

export async function authenticateWithNativeBiometrics(title: string, subtitle: string): Promise<'success' | 'cancelled' | 'failed' | 'unsupported'> {
  const result = window.AndroidBiometricBridge?.authenticateBiometric?.(title, subtitle);
  if (!result) {
    return 'unsupported';
  }
  if (result === 'success' || result === 'cancelled' || result === 'failed' || result === 'unsupported') {
    return result;
  }
  return 'failed';
}

export function subscribeToOpenScreen(handler: (payload: LaunchPayload) => void): () => void {
  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<LaunchPayload>;
    if (customEvent.detail) {
      handler(customEvent.detail);
    }
  };
  window.addEventListener('omnix-open-screen', listener as EventListener);
  return () => window.removeEventListener('omnix-open-screen', listener as EventListener);
}