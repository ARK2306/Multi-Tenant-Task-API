package com.ark.Multi_tenant_api.domain.task;

import com.ark.Multi_tenant_api.domain.task.dto.TaskRequest;
import com.ark.Multi_tenant_api.domain.task.dto.TaskResponse;
import com.ark.Multi_tenant_api.domain.task.dto.TaskStatusRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/projects/{projectId}/tasks")
    public Page<TaskResponse> getAllTasks(@PathVariable UUID projectId, Pageable pageable) {
        return taskService.getTasks(projectId, pageable);
    }

    @PostMapping("/projects/{projectId}/tasks")
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse createTask(@PathVariable UUID projectId,
                                   @Valid @RequestBody TaskRequest request) {
        return taskService.createTask(projectId, request);
    }

    @PatchMapping("/tasks/{id}/status")
    public TaskResponse updateTaskStatus(@PathVariable UUID id,
                                         @Valid @RequestBody TaskStatusRequest request) {
        return taskService.updateTaskStatus(id, request.getStatus());
    }

    @PutMapping("/tasks/{id}")
    public TaskResponse updateTask(@PathVariable UUID id,
                                   @Valid @RequestBody TaskRequest request) {
        return taskService.updateTask(id, request);
    }
    @DeleteMapping("/tasks/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(@PathVariable UUID id) {
        taskService.deleteTask(id);
    }
}