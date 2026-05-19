package com.ark.Multi_tenant_api.domain.project;

import com.ark.Multi_tenant_api.domain.organization.Organization;
import com.ark.Multi_tenant_api.domain.project.dto.ProjectRequest;
import com.ark.Multi_tenant_api.domain.project.dto.ProjectResponse;
import com.ark.Multi_tenant_api.exception.ResourceNotFoundException;
import com.ark.Multi_tenant_api.exception.UnauthorizedAccessException;
import com.ark.Multi_tenant_api.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMapper projectMapper;

    public Page<ProjectResponse> getProjects(Pageable pageable) {
        UUID orgId = UUID.fromString(TenantContext.getCurrentOrgId());
        return projectRepository.findAllByOrganizationId(orgId, pageable)
                .map(projectMapper::toResponse);
    }

    @Transactional
    public ProjectResponse createProject(ProjectRequest request) {
        UUID orgId = UUID.fromString(TenantContext.getCurrentOrgId());

        Organization organization = new Organization();
        organization.setId(orgId);

        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setOrganization(organization);

        return projectMapper.toResponse(projectRepository.save(project));
    }

    @Transactional
    public ProjectResponse updateProject(UUID projectId, ProjectRequest request) {
        UUID orgId = UUID.fromString(TenantContext.getCurrentOrgId());
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (!project.getOrganization().getId().equals(orgId)) {
            throw new UnauthorizedAccessException("Unauthorized");
        }

        project.setName(request.getName());
        project.setDescription(request.getDescription());

        return projectMapper.toResponse(projectRepository.save(project));
    }

    @Transactional
    public void deleteProject(UUID projectId) {
        UUID orgId = UUID.fromString(TenantContext.getCurrentOrgId());
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (!project.getOrganization().getId().equals(orgId)) {
            throw new UnauthorizedAccessException("Unauthorized");
        }

        projectRepository.delete(project);
    }
}