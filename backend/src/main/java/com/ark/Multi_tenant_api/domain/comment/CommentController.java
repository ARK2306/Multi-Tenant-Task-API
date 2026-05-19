package com.ark.Multi_tenant_api.domain.comment;

import com.ark.Multi_tenant_api.domain.comment.dto.CommentRequest;
import com.ark.Multi_tenant_api.domain.comment.dto.CommentResponse;
import com.ark.Multi_tenant_api.domain.user.Role;
import com.ark.Multi_tenant_api.exception.UnauthorizedAccessException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/tasks/{taskId}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public CommentResponse createComment(@PathVariable UUID taskId,
                                         @Valid @RequestBody CommentRequest request,
                                         Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return commentService.createComment(taskId, request, userId);
    }

    @PutMapping("/comments/{id}")
    public CommentResponse updateComment(@PathVariable UUID id,
                                         @Valid @RequestBody CommentRequest request,
                                         Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        Role role = extractRole(authentication);
        return commentService.updateComment(id, request, userId, role);
    }

    @DeleteMapping("/comments/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(@PathVariable UUID id,
                              Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        Role role = extractRole(authentication);
        commentService.deleteComment(id, userId, role);
    }

    private Role extractRole(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .findFirst()
                .map(a -> Role.valueOf(a.getAuthority().replace("ROLE_", "")))
                .orElseThrow(() -> new UnauthorizedAccessException("No role found"));
    }
}