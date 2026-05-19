package com.ark.Multi_tenant_api.domain.task;

import com.ark.Multi_tenant_api.domain.task.dto.TaskResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TaskMapper {

    @Mapping(target = "assigneeId",source = "assignee.id")
    @Mapping(target = "projectId",source = "project.id")
    public TaskResponse toResponse(Task task);


}
