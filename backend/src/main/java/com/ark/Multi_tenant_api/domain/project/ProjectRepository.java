package com.ark.Multi_tenant_api.domain.project;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID> {
    Page<Project> findAllByOrganizationId(UUID organizationId, Pageable pageable);
}
