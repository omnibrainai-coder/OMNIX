import React, { useState } from 'react';
import { authenticateWithNativeBiometrics, canUseNativeBiometrics } from '../utils/nativeAppBridge';

type Props = {
	title: string;
	busy?: boolean;
	error?: string;
	onSubmit: (secret: string) => Promise<void>;
	onBiometricUnlock?: () => Promise<void>;
};

export function SecureLock({ title, busy, error, onSubmit, onBiometricUnlock }: Props) {
	const [secret, setSecret] = useState('');
	const biometricAvailable = canUseNativeBiometrics();

	return (
		<div style={{ position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, 0.94)', backdropFilter: 'blur(14px)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
			<div style={{ width: '100%', maxWidth: '420px', borderRadius: '24px', border: '1px solid #334155', background: 'rgba(15, 23, 42, 0.95)', padding: '22px' }}>
				<div style={{ fontSize: '12px', color: '#7dd3fc', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '8px' }}>Local-first unlock</div>
				<div style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>{title}</div>
				<div style={{ fontSize: '14px', color: '#cbd5e1', marginBottom: '16px', lineHeight: 1.6 }}>Unlock is verified locally on-device. No routine server round-trip is performed.</div>
				{error ? <div style={{ color: '#fca5a5', marginBottom: '10px' }}>{error}</div> : null}
				<input type="password" value={secret} onChange={(event) => setSecret(event.target.value)} placeholder="PIN or password" style={{ width: '100%', borderRadius: '14px', border: '1px solid #334155', background: '#020617', color: '#f8fafc', padding: '12px 14px', boxSizing: 'border-box' }} />
				<button type="button" onClick={() => void onSubmit(secret)} style={{ marginTop: '14px', width: '100%', borderRadius: '999px', border: 'none', background: '#0f766e', color: '#ecfeff', padding: '12px 16px', cursor: 'pointer' }}>
					{busy ? 'Unlocking…' : 'Unlock'}
				</button>
				{biometricAvailable && onBiometricUnlock ? (
					<button
						type="button"
						onClick={() => void (async () => {
							const result = await authenticateWithNativeBiometrics(title, 'Authenticate to unlock locally');
							if (result === 'success') {
								await onBiometricUnlock();
							}
						})()}
						style={{ marginTop: '10px', width: '100%', borderRadius: '999px', border: '1px solid #475569', background: 'transparent', color: '#f8fafc', padding: '12px 16px', cursor: 'pointer' }}
					>
						Use biometrics
					</button>
				) : null}
			</div>
		</div>
	);
}
