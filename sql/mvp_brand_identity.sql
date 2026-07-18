CREATE TABLE mvp_brand_identity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phase TEXT NOT NULL,
    name TEXT NOT NULL,
    brand_identity JSONB NOT NULL,
    color_palette JSONB NOT NULL,
    global_styles JSONB NOT NULL,
    components JSONB NOT NULL,
    branded_pages TEXT[] NOT NULL,
    direction_words TEXT[] NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
