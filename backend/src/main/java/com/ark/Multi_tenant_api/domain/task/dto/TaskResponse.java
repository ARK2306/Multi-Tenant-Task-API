package com.ark.Multi_tenant_api.domain.task.dto;

import com.ark.Multi_tenant_api.domain.task.TaskPriority;
import com.ark.Multi_tenant_api.domain.task.TaskStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Setter
@Getter
public class TaskResponse {
    private UUID id;
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private UUID assigneeId;
    private String assigneeEmail;
    private UUID projectId;
    private LocalDateTime dueDate;
    private LocalDateTime createdAt;
    private LastCommentDto lastComment;
}
