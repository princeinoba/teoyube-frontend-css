CREATE TABLE mvp_ui_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phase TEXT NOT NULL,
    name TEXT NOT NULL,
    project_root TEXT NOT NULL,
    description TEXT,
    pages JSONB NOT NULL,
    totals JSONB NOT NULL,
    next_steps TEXT[] NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO mvp_ui_pages (
    phase,
    name,
    project_root,
    description,
    pages,
    totals,
    next_steps
)
VALUES (
    '4F',
    'Teoyube MVP User Interface Pages',
    'teoyube-app',
    'MVP Next.js UI pages for dashboard, promise clusters, journal, AI companion, and word lexicon.',
    '[
        {"path":"teoyube-app/app/dashboard/page.tsx","name":"Dashboard Page","route":"/dashboard"},
        {"path":"teoyube-app/app/clusters/page.tsx","name":"Promise Clusters Page","route":"/clusters"},
        {"path":"teoyube-app/app/journal/page.tsx","name":"Journal Page","route":"/journal"},
        {"path":"teoyube-app/app/companion/page.tsx","name":"AI Companion Page","route":"/companion"},
        {"path":"teoyube-app/app/words/page.tsx","name":"Word Lexicon Page","route":"/words"}
    ]'::jsonb,
    '{"newOrUpdatedPages":5,"totalStarterPages":8,"dataBackedPages":3,"clientPages":1,"forms":2}'::jsonb,
    ARRAY[
        'Connect dashboard cards to real Daily Word and Prayer data.',
        'Persist journal entries through /api/journal.',
        'Add dynamic word detail pages at /words/[word].',
        'Add dynamic cluster detail pages at /clusters/[id].',
        'Connect companion responses to the full canon and OpenAI API.'
    ]
);
