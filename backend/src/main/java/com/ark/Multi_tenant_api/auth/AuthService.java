package com.ark.Multi_tenant_api.auth;

import com.ark.Multi_tenant_api.domain.organization.Organization;
import com.ark.Multi_tenant_api.domain.organization.OrganizationRepository;
import com.ark.Multi_tenant_api.domain.user.Role;
import com.ark.Multi_tenant_api.domain.user.User;
import com.ark.Multi_tenant_api.domain.user.UserRepository;
import com.ark.Multi_tenant_api.security.JwtUtil;
import com.ark.Multi_tenant_api.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }

        Organization organization = new Organization();
        organization.setName(request.getOrganizationName());
        organizationRepository.save(organization);

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.OWNER);
        user.setOrganization(organization);
        userRepository.save(user);

        String token = jwtUtil.generateToken(
                user.getId(),
                organization.getId(),
                user.getRole().name()
        );

        return new AuthResponse(token, user.getId().toString(), user.getEmail(),
                user.getRole().name(), organization.getName());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(
                user.getId(),
                user.getOrganization().getId(),
                user.getRole().name()
        );

        return new AuthResponse(token, user.getId().toString(), user.getEmail(),
                user.getRole().name(), user.getOrganization().getName());
    }

    @Transactional
    public AuthResponse invite(InviteRequest request) {
        String orgId = TenantContext.getCurrentOrgId();
        Organization organization = organizationRepository.findById(UUID.fromString(orgId))
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode("ChangeMe123!"));
        user.setRole(request.getRole());
        user.setOrganization(organization);
        userRepository.save(user);

        String token = jwtUtil.generateToken(
                user.getId(),
                organization.getId(),
                user.getRole().name()
        );

        return new AuthResponse(token, user.getId().toString(), user.getEmail(),
                user.getRole().name(), organization.getName());
    }
}