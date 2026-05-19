package com.ark.Multi_tenant_api.auth;

import com.ark.Multi_tenant_api.domain.user.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class InviteRequest {

    @Email
    @NotBlank
    private String email;

    @NotNull
    private Role role;
}