CREATE TABLE projects (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          name VARCHAR(255) NOT NULL,
                          description VARCHAR(255),
                          status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
                          organization_id UUID NOT NULL REFERENCES organizations(id),
                          created_at TIMESTAMP NOT NULL DEFAULT NOW()
);