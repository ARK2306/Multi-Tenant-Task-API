package com.ark.Multi_tenant_api.domain.project;

import com.ark.Multi_tenant_api.domain.organization.Organization;
import com.ark.Multi_tenant_api.domain.organization.OrganizationRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class ProjectRepositoryTest {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Test
    void shouldOnlyReturnProjectsForCurrentOrganization() {

        Organization org1 = new Organization();
        org1.setName("Test-1 Org");
        Organization org2 = new Organization();
        org2.setName("Test-2 Org");

        organizationRepository.save(org1);
        organizationRepository.save(org2);

        Project project1 = new Project();
        project1.setName("Project 1");
        project1.setOrganization(org1);
        Project project2 = new Project();
        project2.setName("Project 2");
        project2.setOrganization(org2);

        projectRepository.save(project1);
        projectRepository.save(project2);

        Page<Project> results = projectRepository.findAllByOrganizationId(org1.getId(), Pageable.unpaged());

        assertThat(results.getContent()).hasSize(1);
        assertThat(results.getContent().getFirst().getName()).isEqualTo("Project 1");

    }

}