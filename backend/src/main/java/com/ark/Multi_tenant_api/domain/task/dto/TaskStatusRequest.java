package com.ark.Multi_tenant_api.domain.task.dto;

import com.ark.Multi_tenant_api.domain.task.TaskStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class TaskStatusRequest {
    @NotNull
    private TaskStatus status;
}