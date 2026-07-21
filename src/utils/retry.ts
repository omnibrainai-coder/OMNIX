export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: { retries?: number; initialDelayMs?: number; factor?: number; onRetry?: (attempt: number, error: unknown) => void } = {},
): Promise<T> {
  const retries = options.retries ?? 4;
  const initialDelayMs = options.initialDelayMs ?? 350;
  const factor = options.factor ?? 2;

  let attempt = 0;
  let delay = initialDelayMs;
  while (true) {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= retries) {
        throw error;
      }
      options.onRetry?.(attempt + 1, error);
      await new Promise((resolve) => window.setTimeout(resolve, delay));
      attempt += 1;
      delay *= factor;
    }
  }
}