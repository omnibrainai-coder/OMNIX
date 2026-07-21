import React from 'react';
import { SecureLock } from '../SecureLock';

export function DMLock({ title, busy, error, onSubmit, onBiometricUnlock }: { title: string; busy?: boolean; error?: string; onSubmit: (secret: string) => Promise<void>; onBiometricUnlock?: () => Promise<void> }) {
	return <SecureLock title={title} busy={busy} error={error} onSubmit={onSubmit} onBiometricUnlock={onBiometricUnlock} />;
}
