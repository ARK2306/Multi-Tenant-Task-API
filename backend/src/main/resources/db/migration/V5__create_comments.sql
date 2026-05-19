CREATE TABLE comments (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          content TEXT NOT NULL,
                          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                          task_id UUID NOT NULL REFERENCES tasks(id),
                          author_id UUID NOT NULL REFERENCES users(id),
                          organization_id UUID NOT NULL REFERENCES organizations(id)
);