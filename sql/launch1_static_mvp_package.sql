CREATE TABLE launch1_static_mvp_package (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phase TEXT NOT NULL,
    name TEXT NOT NULL,
    goal TEXT NOT NULL,
    includes TEXT[] NOT NULL,
    project_root TEXT NOT NULL,
    folders TEXT[] NOT NULL,
    pages TEXT[] NOT NULL,
    components TEXT[] NOT NULL,
    data_files TEXT[] NOT NULL,
    utility_files TEXT[] NOT NULL,
    styling_files TEXT[] NOT NULL,
    completion_standard TEXT[] NOT NULL,
    status JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
