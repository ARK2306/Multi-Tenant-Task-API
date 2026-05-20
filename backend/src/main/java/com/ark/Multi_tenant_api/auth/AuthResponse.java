package com.ark.Multi_tenant_api.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String id;
    private String email;
    private String role;
    private String organizationName;
}