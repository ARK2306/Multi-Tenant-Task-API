package com.ark.Multi_tenant_api.domain.comment;

import com.ark.Multi_tenant_api.domain.comment.dto.CommentResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CommentMapper {
    @Mapping(source = "author.id", target = "authorId")
    @Mapping(source = "task.id", target = "taskId")
    CommentResponse toResponse(Comment comment);
}