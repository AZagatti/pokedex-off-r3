const cache = new Map<string, unknown>();

export function getFromCache<T>(key: string): T | null {
	return (cache.get(key) as T) || null;
}

export function setInCache<T>(key: string, value: T): void {
	cache.set(key, value);
}

export async function fetchWithCache<T>(
	url: string,
	schema: { parse: (data: unknown) => T }
): Promise<T> {
	const cached = getFromCache<T>(url);
	if (cached) {
		return cached;
	}

	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}: ${response.status}`);
	}

	const data = await response.json();
	const parsed = schema.parse(data);
	setInCache(url, parsed);
	return parsed;
}
