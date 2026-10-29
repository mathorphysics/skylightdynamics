type CmsImageRecord = {
	id?: string;
	collectionName?: string;
};

export function cmsImageUrl<T extends CmsImageRecord>(
	record: T,
	fileField: string,
	urlField: string,
	fallback = '',
) {
	const values = record as CmsImageRecord & Record<string, unknown>;
	const filename = values[fileField];

	if (typeof filename === 'string' && filename && record.id) {
		const collection = record.collectionName || 'articles';

		return `/hcgi/platform/api/files/${encodeURIComponent(collection)}/${encodeURIComponent(record.id)}/${encodeURIComponent(filename)}`;
	}

	const externalUrl = values[urlField];

	return typeof externalUrl === 'string' && externalUrl ? externalUrl : fallback;
}
