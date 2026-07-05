/*
=========================================================
Project : Real Estate CRM SaaS
Migration: 013_create_teams_table.sql
Purpose : Sales & Telecalling Teams
=========================================================
*/

CREATE TABLE teams (

    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid(),

    company_id BIGINT NOT NULL,
    branch_id BIGINT NOT NULL,

    team_code VARCHAR(30) NOT NULL,
    team_name VARCHAR(150) NOT NULL,

    description TEXT,

    team_leader_user_id BIGINT,

    status user_status NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    created_by BIGINT,
    updated_by BIGINT,

    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,

    CONSTRAINT uq_team_uuid UNIQUE(uuid),

    CONSTRAINT uq_company_team_code
        UNIQUE(company_id, team_code),

    CONSTRAINT fk_team_company
        FOREIGN KEY(company_id)
        REFERENCES companies(id),

    CONSTRAINT fk_team_branch
        FOREIGN KEY(branch_id)
        REFERENCES branches(id),

    CONSTRAINT fk_team_leader
        FOREIGN KEY(team_leader_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_team_company
ON teams(company_id);

CREATE INDEX idx_team_branch
ON teams(branch_id);

CREATE INDEX idx_team_leader
ON teams(team_leader_user_id);