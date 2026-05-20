package com.ark.Multi_tenant_api.domain.task.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class LastCommentDto {
    private String content;
    private String authorEmail;
    private LocalDateTime createdAt;
}
