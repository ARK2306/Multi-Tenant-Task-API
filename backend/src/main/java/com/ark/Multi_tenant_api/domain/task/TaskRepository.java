package com.ark.Multi_tenant_api.domain.task;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID> {
    Page<Task> findAllByProjectIdAndOrganizationId(UUID projectId, UUID organizationId, Pageable pageable);

}
