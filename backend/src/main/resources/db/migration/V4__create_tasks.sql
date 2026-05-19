CREATE TABLE tasks (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       title VARCHAR(255) NOT NULL,
                       description VARCHAR(255),
                       status VARCHAR(50) NOT NULL DEFAULT 'TODO',
                       priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
                       due_date TIMESTAMP,
                       started_at TIMESTAMP,
                       created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                       project_id UUID NOT NULL REFERENCES projects(id),
                       assignee_id UUID REFERENCES users(id),
                       organization_id UUID NOT NULL REFERENCES organizations(id)
);