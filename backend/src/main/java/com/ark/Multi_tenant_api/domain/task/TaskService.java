package com.ark.Multi_tenant_api.domain.task;

import com.ark.Multi_tenant_api.domain.project.Project;
import com.ark.Multi_tenant_api.domain.project.ProjectRepository;
import com.ark.Multi_tenant_api.domain.task.dto.TaskRequest;
import com.ark.Multi_tenant_api.domain.task.dto.TaskResponse;
import com.ark.Multi_tenant_api.domain.user.User;
import com.ark.Multi_tenant_api.domain.user.UserRepository;
import com.ark.Multi_tenant_api.exception.ResourceNotFoundException;
import com.ark.Multi_tenant_api.exception.UnauthorizedAccessException;
import com.ark.Multi_tenant_api.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskMapper taskMapper;

    public Page<TaskResponse> getTasks(UUID projectId, Pageable pageable) {
        UUID orgId = UUID.fromString(TenantContext.getCurrentOrgId());
        return taskRepository.findAllByProjectIdAndOrganizationId(projectId, orgId, pageable)
                .map(taskMapper::toResponse);
    }

    @Transactional
    public TaskResponse createTask(UUID projectId, TaskRequest request) {
        UUID orgId = UUID.fromString(TenantContext.getCurrentOrgId());

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (!project.getOrganization().getId().equals(orgId)) {
            throw new UnauthorizedAccessException("Project does not belong to your organization");
        }

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());
        task.setProject(project);
        task.setOrganization(project.getOrganization());

        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found"));
            task.setAssignee(assignee);
        }

        return taskMapper.toResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse updateTaskStatus(UUID taskId, TaskStatus newStatus) {
        UUID orgId = UUID.fromString(TenantContext.getCurrentOrgId());

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (!task.getOrganization().getId().equals(orgId)) {
            throw new UnauthorizedAccessException("Task does not belong to your organization");
        }

        TaskStatusTransitionValidator.validate(task.getStatus(), newStatus);

        if (newStatus == TaskStatus.IN_PROGRESS && task.getStartedAt() == null) {
            task.setStartedAt(LocalDateTime.now());
        }

        task.setStatus(newStatus);
        return taskMapper.toResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse updateTask(UUID taskId, TaskRequest request) {
        UUID orgId = UUID.fromString(TenantContext.getCurrentOrgId());

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (!task.getOrganization().getId().equals(orgId)) {
            throw new UnauthorizedAccessException("Task does not belong to your organization");
        }

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());

        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found"));
            task.setAssignee(assignee);
        }

        return taskMapper.toResponse(taskRepository.save(task));
    }
}