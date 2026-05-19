package com.ark.Multi_tenant_api.domain.project.dto;

import com.ark.Multi_tenant_api.domain.project.ProjectStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter
public class ProjectResponse {
    private UUID id;
    private String name;
    private String description;
    private ProjectStatus status;
    private LocalDateTime createdAt;
}