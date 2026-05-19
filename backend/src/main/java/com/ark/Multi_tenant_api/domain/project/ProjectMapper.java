package com.ark.Multi_tenant_api.domain.project;

import com.ark.Multi_tenant_api.domain.project.dto.ProjectResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProjectMapper {
    ProjectResponse toResponse(Project project);
}