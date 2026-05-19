package com.ark.Multi_tenant_api.domain.task.dto;

import com.ark.Multi_tenant_api.domain.task.TaskPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter
public class TaskRequest {

    @NotBlank
    private String title;

    private String description;

    @NotNull
    private TaskPriority priority;

    private UUID assigneeId;

    private LocalDateTime dueDate;
}