package com.ark.Multi_tenant_api.domain.project.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ProjectRequest {

    @NotBlank
    private String name;

    private String description;
}