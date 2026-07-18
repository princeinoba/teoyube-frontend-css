CREATE TABLE mvp_code_starter_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phase TEXT NOT NULL,
    name TEXT NOT NULL,
    project_root TEXT NOT NULL,
    description TEXT,
    files JSONB NOT NULL,
    starter_stats JSONB NOT NULL,
    next_steps TEXT[] NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO mvp_code_starter_files (
    phase,
    name,
    project_root,
    description,
    files,
    starter_stats,
    next_steps
)
VALUES (
    '4D',
    'Teoyube MVP Code Starter Files',
    'teoyube-app',
    'A Next.js MVP starter with pages, API routes, utility functions, package metadata, and seed JSON for the Teoyube app.',
    '[
        {"path":"teoyube-app/package.json","type":"config","purpose":"Defines the Next.js, React, Prisma, OpenAI, and TypeScript starter dependencies."},
        {"path":"teoyube-app/lib/dailyWord.ts","type":"utility","purpose":"Selects a deterministic daily word from the seed word list."},
        {"path":"teoyube-app/lib/recommendations.ts","type":"utility","purpose":"Maps user needs to Promise Clusters."},
        {"path":"teoyube-app/lib/prayerEngine.ts","type":"utility","purpose":"Builds prayer sequences, meaning flow, prayer text, and declaration text."},
        {"path":"teoyube-app/app/page.tsx","type":"page","purpose":"Home page linking to dashboard, daily word, prayer, journal, and companion routes."},
        {"path":"teoyube-app/app/daily-word/page.tsx","type":"page","purpose":"Daily Word page backed by the word seed file and daily word utility."},
        {"path":"teoyube-app/app/prayer/page.tsx","type":"page","purpose":"Prayer Library page backed by prayer seed JSON."},
        {"path":"teoyube-app/app/api/daily-word/route.ts","type":"api","purpose":"Returns the daily word as JSON."},
        {"path":"teoyube-app/app/api/ai/companion/route.ts","type":"api","purpose":"Returns a starter AI companion response using the recommendation utility."},
        {"path":"teoyube-app/data/teoyubeWords.json","type":"seed","purpose":"Starter Teoyube word seed data."},
        {"path":"teoyube-app/data/prayers.json","type":"seed","purpose":"Starter prayer seed data."}
    ]'::jsonb,
    '{"pages":6,"apiRoutes":2,"utilities":3,"seedFiles":2,"starterWords":2,"starterPrayers":2}'::jsonb,
    ARRAY[
        'Install dependencies inside teoyube-app.',
        'Run npm run dev from teoyube-app.',
        'Replace starter word data with the full 108-word Teoyube canon.',
        'Add Prisma schema and seed script.',
        'Connect the AI companion route to the OpenAI API when environment variables are ready.'
    ]
);
