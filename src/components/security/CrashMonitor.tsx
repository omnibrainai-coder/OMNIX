import { useEffect } from 'react';

export function CrashMonitor() {
	useEffect(() => {
		const handleError = (event: ErrorEvent) => {
			console.error('Global window error', event.error ?? event.message);
		};
		const handleRejection = (event: PromiseRejectionEvent) => {
			console.error('Unhandled promise rejection', event.reason);
		};

		window.addEventListener('error', handleError);
		window.addEventListener('unhandledrejection', handleRejection);
		return () => {
			window.removeEventListener('error', handleError);
			window.removeEventListener('unhandledrejection', handleRejection);
		};
	}, []);

	return null;
}
