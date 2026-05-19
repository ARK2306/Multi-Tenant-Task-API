package com.ark.Multi_tenant_api.domain.comment.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter
public class CommentResponse {
    private UUID id;
    private String content;
    private UUID authorId;
    private UUID taskId;
    private LocalDateTime createdAt;
}