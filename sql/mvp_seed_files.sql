CREATE TABLE mvp_seed_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phase TEXT NOT NULL,
    name TEXT NOT NULL,
    project_root TEXT NOT NULL,
    description TEXT,
    seed_files JSONB NOT NULL,
    totals JSONB NOT NULL,
    integration_targets TEXT[] NOT NULL,
    next_steps TEXT[] NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO mvp_seed_files (
    phase,
    name,
    project_root,
    description,
    seed_files,
    totals,
    integration_targets,
    next_steps
)
VALUES (
    '4E',
    'Full Seed Files for Teoyube MVP',
    'teoyube-app',
    'Full MVP seed layer for Promise Clusters, Covenant Paths, Archetypes, and Prayer templates.',
    '[
        {"path":"teoyube-app/data/promiseClusters.json","label":"Promise Clusters","count":12,"primaryKey":"id"},
        {"path":"teoyube-app/data/covenantPaths.json","label":"Covenant Paths","count":12,"primaryKey":"id"},
        {"path":"teoyube-app/data/archetypes.json","label":"Archetypes","count":24,"primaryKey":"id"},
        {"path":"teoyube-app/data/prayers.json","label":"Prayers","count":12,"primaryKey":"id"}
    ]'::jsonb,
    '{"seedFiles":4,"promiseClusters":12,"covenantPaths":12,"archetypes":24,"prayers":12,"totalRecords":60}'::jsonb,
    ARRAY[
        'Daily Word',
        'Promise Clusters',
        'Prayer Library',
        'Covenant Paths',
        'Archetype Discovery',
        'AI Companion',
        'Recommendation Engine'
    ],
    ARRAY[
        'Connect Promise Cluster pages to data/promiseClusters.json.',
        'Connect Prayer Library to the expanded data/prayers.json.',
        'Use covenantPaths.json for user journey progress.',
        'Use archetypes.json during onboarding and assessment.',
        'Map the full 108-word canon into teoyubeWords.json.'
    ]
);
