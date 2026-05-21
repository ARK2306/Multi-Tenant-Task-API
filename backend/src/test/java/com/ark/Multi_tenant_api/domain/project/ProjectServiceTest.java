package com.ark.Multi_tenant_api.domain.project;

import static org.junit.jupiter.api.Assertions.*;

import com.ark.Multi_tenant_api.domain.organization.Organization;
import com.ark.Multi_tenant_api.exception.UnauthorizedAccessException;
import com.ark.Multi_tenant_api.tenant.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ProjectMapper projectMapper;

    @InjectMocks
    private ProjectService projectService;

    private UUID org1Id;
    private UUID org2Id;

    @BeforeEach
    void setUp() {
        org1Id = UUID.randomUUID();
        org2Id = UUID.randomUUID();
        TenantContext.setCurrentOrgId(org1Id.toString());
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void shouldThrowUnauthorizedWhenProjectBelongsToDifferentOrg() {
        // Arrange
        UUID projectId = UUID.randomUUID();

        Organization org2 = new Organization();
        org2.setId(org2Id);

        Project project = new Project();
        project.setId(projectId);
        project.setOrganization(org2); // belongs to org2

        when(projectRepository.findById(projectId))
                .thenReturn(Optional.of(project));

        // Act + Assert
        // Current tenant is org1 but project belongs to org2
        assertThrows(UnauthorizedAccessException.class, () ->
                projectService.deleteProject(projectId)
        );
    }
}