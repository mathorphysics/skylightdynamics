# skylightdynamics
drone light show website

## Content management

The site uses PocketBase as its CMS. Non-developers can sign in to the PocketBase dashboard and maintain these collections:

- `site_settings`: homepage hero text, opening image upload, image URL fallback, and video URL.
- `performance_media`: Showcase gallery images, captions, ordering, and publish status.
- `articles`: research and commercial-idea articles, including title, URL slug, category, excerpt, rich-text body, cover image, publish date, featured status, and publish status.
- `enquiries`: messages submitted through the website contact form.

### Publishing an article

1. Open `articles` and create a record.
2. Enter a unique lowercase slug using hyphens, for example `designing-for-city-events`.
3. Upload a cover image or provide a fallback image URL.
4. Write the article in the rich-text `body` field.
5. Set `published_at`, turn on `published`, and save.

Only records with `published` enabled appear on the public website. Locally, the dashboard is available from the PocketBase service (normally `http://localhost:8090/_/`). Production credentials and the dashboard URL are managed by the hosting environment.
