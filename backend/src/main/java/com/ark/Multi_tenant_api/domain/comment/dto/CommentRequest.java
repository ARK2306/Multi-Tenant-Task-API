package com.ark.Multi_tenant_api.domain.comment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class CommentRequest {
    @NotBlank
    private String content;
}