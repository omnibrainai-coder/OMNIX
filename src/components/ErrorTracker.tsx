import React from 'react';

type Props = {
	children: React.ReactNode;
};

type State = {
	hasError: boolean;
	errorMessage: string;
};

export class ErrorTracker extends React.Component<Props, State> {
	state: State = {
		hasError: false,
		errorMessage: '',
	};

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, errorMessage: error.message || 'Unexpected UI failure' };
	}

	componentDidCatch(error: Error, info: React.ErrorInfo) {
		console.error('UI boundary captured error', error, info);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617', color: '#f8fafc', padding: '24px' }}>
					<div style={{ maxWidth: '480px', borderRadius: '24px', border: '1px solid #334155', background: 'rgba(15, 23, 42, 0.9)', padding: '24px' }}>
						<div style={{ fontSize: '12px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#fca5a5', marginBottom: '10px' }}>Recovered failure</div>
						<div style={{ fontSize: '24px', fontWeight: 800, marginBottom: '10px' }}>The app recovered from a rendering failure.</div>
						<div style={{ fontSize: '14px', color: '#cbd5e1', marginBottom: '18px', lineHeight: 1.6 }}>{this.state.errorMessage}</div>
						<button type="button" onClick={() => window.location.reload()} style={{ borderRadius: '999px', border: 'none', background: '#0f766e', color: '#ecfeff', padding: '12px 16px', cursor: 'pointer' }}>
							Reload safely
						</button>
					</div>
				</div>
			);
		}
		return this.props.children;
	}
}
