package com.ark.Multi_tenant_api.domain.comment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CommentRepository extends JpaRepository<Comment, UUID> {
    List<Comment> findAllByTaskId(UUID taskId);
    Optional<Comment> findTopByTaskIdOrderByCreatedAtDesc(UUID taskId);
    void deleteAllByTaskProjectId(UUID projectId);
}