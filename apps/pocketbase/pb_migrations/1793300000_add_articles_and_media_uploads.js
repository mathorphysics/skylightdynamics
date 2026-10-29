/// <reference path="../pb_data/types.d.ts" />

const imageField = (name) =>
  new FileField({
    name,
    maxSelect: 1,
    maxSize: 15 * 1024 * 1024,
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    thumbs: ['640x0', '1280x0', '1920x0'],
  });

const addFieldIfMissing = (collection, field) => {
  if (collection.fields.fieldNames().indexOf(field.name) === -1) {
    collection.fields.add(field);
  }
};

migrate(
  (app) => {
    const performanceMedia = app.findCollectionByNameOrId('performance_media');
    addFieldIfMissing(performanceMedia, imageField('image_file'));
    app.save(performanceMedia);

    const siteSettings = app.findCollectionByNameOrId('site_settings');
    addFieldIfMissing(siteSettings, imageField('opening_image_file'));
    app.save(siteSettings);

    let articles;
    try {
      articles = app.findCollectionByNameOrId('articles');
    } catch (_) {
      articles = new Collection({
        type: 'base',
        name: 'articles',
        listRule: 'published = true',
        viewRule: 'published = true',
        createRule: null,
        updateRule: null,
        deleteRule: null,
        fields: [
          { name: 'title', type: 'text', required: true, max: 200 },
          { name: 'slug', type: 'text', required: true, max: 200 },
          {
            name: 'category',
            type: 'select',
            required: true,
            maxSelect: 1,
            values: ['Research', 'Commercial ideas'],
          },
          { name: 'excerpt', type: 'text', required: true, max: 500 },
          { name: 'body', type: 'editor', required: true },
          {
            name: 'cover_image',
            type: 'file',
            maxSelect: 1,
            maxSize: 15 * 1024 * 1024,
            mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
            thumbs: ['640x0', '1280x0', '1920x0'],
          },
          { name: 'cover_image_url', type: 'url' },
          { name: 'published_at', type: 'date', required: true },
          { name: 'featured', type: 'bool' },
          { name: 'published', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE UNIQUE INDEX idx_articles_slug ON articles (slug)'],
      });
      app.save(articles);
    }

    const existingArticles = app.findRecordsByFilter('articles', '1=1');
    if (existingArticles.length === 0) {
      const seeds = [
        {
          title: 'Designing for urban night skies',
          slug: 'designing-for-urban-night-skies',
          category: 'Research',
          excerpt:
            'How scale, viewing distance and the character of a place shape a drone-light composition.',
          body:
            '<p>A city skyline is never a blank canvas. Buildings, ambient light and the movement of an audience all influence how a formation is perceived.</p><h2>Design begins with the place</h2><p>We study sightlines, scale and visual rhythm before choreography begins. The goal is not simply to place an image in the sky, but to create a composition that belongs to its setting.</p><h2>Clarity at a distance</h2><p>Strong silhouettes, controlled transitions and considered pacing help an idea remain legible across a large viewing area. Every movement has to support the story as well as the technical environment.</p>',
          cover:
            'https://images.hostinger.com/cf8a50bf-40b7-467e-9ba0-86cc7ca1a9d3/e2fa714b-b8aa-4dc5-a061-320246660545.png',
          publishedAt: '2026-10-15 12:00:00.000Z',
          featured: true,
        },
        {
          title: 'Brand storytelling at monumental scale',
          slug: 'brand-storytelling-at-monumental-scale',
          category: 'Commercial ideas',
          excerpt:
            'Turning a campaign thought into a public moment people can experience and share together.',
          body:
            '<p>Drone light offers brands something rare: a message can become an event, experienced collectively rather than simply viewed on a screen.</p><h2>More than a logo reveal</h2><p>The strongest branded performances build anticipation, create transformation and earn the final image. Narrative gives the audience a reason to stay with the story.</p><h2>Designed to travel</h2><p>A live spectacle can also become a rich source of campaign material. Camera positions, key formations and timing can be planned for both the audience on site and the viewers who discover it later.</p>',
          cover:
            'https://images.hostinger.com/cf8a50bf-40b7-467e-9ba0-86cc7ca1a9d3/bba4f474-83f0-47b7-9324-6308fa422e11.png',
          publishedAt: '2026-09-22 12:00:00.000Z',
        },
        {
          title: 'From festival moment to shared memory',
          slug: 'from-festival-moment-to-shared-memory',
          category: 'Commercial ideas',
          excerpt:
            'Why collective attention, pacing and a sense of place matter when designing for live audiences.',
          body:
            '<p>At a festival or civic celebration, the audience arrives with different expectations but looks up at the same sky. That shared point of focus is the beginning of a memorable experience.</p><h2>Build a collective rhythm</h2><p>Quiet passages make scale feel larger. Surprising transitions create energy. A carefully structured sequence gives a crowd time to notice, react and anticipate together.</p><h2>Leave room for wonder</h2><p>Technology makes the performance possible, but emotion is what remains. Our research asks how each technical choice can make the final experience feel more human.</p>',
          cover:
            'https://images.hostinger.com/cf8a50bf-40b7-467e-9ba0-86cc7ca1a9d3/e2fa714b-b8aa-4dc5-a061-320246660545.png',
          publishedAt: '2026-08-30 12:00:00.000Z',
        },
      ];

      for (const seed of seeds) {
        const record = new Record(articles);
        record.set('title', seed.title);
        record.set('slug', seed.slug);
        record.set('category', seed.category);
        record.set('excerpt', seed.excerpt);
        record.set('body', seed.body);
        record.set('cover_image_url', seed.cover);
        record.set('published_at', seed.publishedAt);
        record.set('featured', seed.featured || false);
        record.set('published', true);
        app.save(record);
      }
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('articles'));
    } catch (_) {}

    try {
      const performanceMedia = app.findCollectionByNameOrId('performance_media');
      performanceMedia.fields.removeByName('image_file');
      app.save(performanceMedia);
    } catch (_) {}

    try {
      const siteSettings = app.findCollectionByNameOrId('site_settings');
      siteSettings.fields.removeByName('opening_image_file');
      app.save(siteSettings);
    } catch (_) {}
  },
);
