export const PUBLIC_POCKETBASE_URL = (
	import.meta.env.VITE_POCKETBASE_URL || '/hcgi/platform'
).replace(/\/$/, '');
