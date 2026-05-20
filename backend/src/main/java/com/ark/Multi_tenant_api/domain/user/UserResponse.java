package com.ark.Multi_tenant_api.domain.user;

import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class UserResponse {
    private final String id;
    private final String email;
    private final String name;
    private final String role;
    private final LocalDateTime createdAt;

    public UserResponse(User user) {
        this.id = user.getId().toString();
        this.email = user.getEmail();
        this.name = user.getEmail().split("@")[0];
        this.role = user.getRole().name();
        this.createdAt = user.getCreatedAt();
    }
}
