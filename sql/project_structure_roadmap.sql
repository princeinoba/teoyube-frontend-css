CREATE TABLE project_structure_roadmap (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phase TEXT NOT NULL,
    name TEXT NOT NULL,
    recommended_project_name TEXT NOT NULL,
    project_structure JSONB NOT NULL,
    seed_file_plan JSONB NOT NULL,
    api_route_plan JSONB NOT NULL,
    core_utility_functions JSONB NOT NULL,
    implementation_roadmap JSONB NOT NULL,
    mvp_features TEXT[] NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO project_structure_roadmap (
    phase,
    name,
    recommended_project_name,
    project_structure,
    seed_file_plan,
    api_route_plan,
    core_utility_functions,
    implementation_roadmap,
    mvp_features
)
VALUES (
    '4C',
    'Teoyube Project Structure & Implementation Roadmap',
    'teoyube-app',
    '[]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    ARRAY[
        'Daily Word',
        '108-word Lexicon',
        'Scripture-linked word pages',
        'Promise Clusters',
        'Prayer Library',
        'Journal',
        'AI Spiritual Companion',
        'Basic user profile'
    ]
);
