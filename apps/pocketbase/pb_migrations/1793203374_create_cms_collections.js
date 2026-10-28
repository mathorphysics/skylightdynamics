/// <reference path="../pb_data/types.d.ts" />

// Creates two backend-managed collections so the site owner can edit the
// homepage content (hero media + copy, and the showcase gallery) through the
// PocketBase admin dashboard — a WordPress-style CMS alternative.
// Reads are public (the homepage is public); writes are superuser-only
// (the admin dashboard bypasses rules, so `null` = nobody via REST).
migrate(
  (app) => {
    // ---- performance_media (showcase gallery) ----
    let perfCollection;
    try {
      perfCollection = app.findCollectionByNameOrId('performance_media');
    } catch (_) {
      perfCollection = new Collection({
        type: 'base',
        name: 'performance_media',
        listRule: '',
        viewRule: '',
        createRule: null,
        updateRule: null,
        deleteRule: null,
        fields: [
          { name: 'title', type: 'text', required: true, max: 200 },
          { name: 'detail', type: 'text', max: 200 },
          { name: 'image', type: 'text', required: true, max: 1000 },
          { name: 'alt', type: 'text', required: true, max: 300 },
          { name: 'sort_order', type: 'number' },
          { name: 'published', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      });
      app.save(perfCollection);
    }

    // Seed the gallery with the existing showcase items if empty.
    const existingPerf = app.findRecordsByFilter('performance_media', '1=1');
    if (existingPerf.length === 0) {
      const seeds = [
        {
          title: 'Light in motion',
          detail: 'Fluid forms · Infinite possibilities',
          image:
            'https://images.hostinger.com/cf8a50bf-40b7-467e-9ba0-86cc7ca1a9d3/e2fa714b-b8aa-4dc5-a061-320246660545.png',
          alt: 'Blue points of light creating a flowing wave across the night sky',
          sort_order: 1,
        },
        {
          title: 'A new dimension',
          detail: 'Precision formations · Monumental scale',
          image:
            'https://images.hostinger.com/cf8a50bf-40b7-467e-9ba0-86cc7ca1a9d3/bba4f474-83f0-47b7-9324-6308fa422e11.png',
          alt: 'White points of light arranged in a geometric starburst over water',
          sort_order: 2,
        },
      ];
      for (const s of seeds) {
        const rec = new Record(perfCollection);
        rec.set('title', s.title);
        rec.set('detail', s.detail);
        rec.set('image', s.image);
        rec.set('alt', s.alt);
        rec.set('sort_order', s.sort_order);
        rec.set('published', true);
        app.save(rec);
      }
    }

    // ---- site_settings (hero media + copy, singleton) ----
    let settingsCollection;
    try {
      settingsCollection = app.findCollectionByNameOrId('site_settings');
    } catch (_) {
      settingsCollection = new Collection({
        type: 'base',
        name: 'site_settings',
        listRule: '',
        viewRule: '',
        createRule: null,
        updateRule: null,
        deleteRule: null,
        fields: [
          { name: 'opening_image', type: 'text', required: true, max: 1000 },
          { name: 'opening_video', type: 'text', max: 1000 },
          { name: 'hero_eyebrow', type: 'text', max: 100 },
          { name: 'hero_headline_1', type: 'text', max: 100 },
          { name: 'hero_headline_2', type: 'text', max: 100 },
          { name: 'hero_headline_3', type: 'text', max: 100 },
          { name: 'hero_subtext', type: 'text', max: 300 },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      });
      app.save(settingsCollection);
    }

    // Seed a single settings record with the current homepage values if empty.
    const existingSettings = app.findRecordsByFilter('site_settings', '1=1');
    if (existingSettings.length === 0) {
      const rec = new Record(settingsCollection);
      rec.set(
        'opening_image',
        'https://images.hostinger.com/cf8a50bf-40b7-467e-9ba0-86cc7ca1a9d3/7cf1a1c7-e1b7-4dad-9417-6051d32dd038.png',
      );
      rec.set('opening_video', '');
      rec.set('hero_eyebrow', 'DRONE LIGHT PERFORMANCES');
      rec.set('hero_headline_1', 'The sky is');
      rec.set('hero_headline_2', 'only the');
      rec.set('hero_headline_3', 'beginning.');
      rec.set(
        'hero_subtext',
        'Extraordinary light. Perfectly choreographed.\nA spectacle that stays with you.',
      );
      app.save(rec);
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('performance_media'));
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('site_settings'));
    } catch (_) {}
  },
);
