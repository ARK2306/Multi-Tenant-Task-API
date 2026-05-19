package com.ark.Multi_tenant_api.domain.comment;

import com.ark.Multi_tenant_api.domain.comment.dto.CommentRequest;
import com.ark.Multi_tenant_api.domain.comment.dto.CommentResponse;
import com.ark.Multi_tenant_api.domain.task.Task;
import com.ark.Multi_tenant_api.domain.task.TaskRepository;
import com.ark.Multi_tenant_api.domain.user.Role;
import com.ark.Multi_tenant_api.domain.user.User;
import com.ark.Multi_tenant_api.domain.user.UserRepository;
import com.ark.Multi_tenant_api.exception.ResourceNotFoundException;
import com.ark.Multi_tenant_api.exception.UnauthorizedAccessException;
import com.ark.Multi_tenant_api.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final CommentMapper commentMapper;

    @Transactional
    public CommentResponse createComment(UUID taskId, CommentRequest request, UUID userId) {
        UUID orgId = UUID.fromString(TenantContext.getCurrentOrgId());

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (!task.getOrganization().getId().equals(orgId)) {
            throw new UnauthorizedAccessException("Task does not belong to your organization");
        }

        User author = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Comment comment = new Comment();
        comment.setContent(request.getContent());
        comment.setTask(task);
        comment.setAuthor(author);
        comment.setOrganization(task.getOrganization());

        return commentMapper.toResponse(commentRepository.save(comment));
    }

    @Transactional
    public CommentResponse updateComment(UUID commentId, CommentRequest request, UUID userId, Role role) {
        UUID orgId = UUID.fromString(TenantContext.getCurrentOrgId());

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        if (!comment.getOrganization().getId().equals(orgId)) {
            throw new UnauthorizedAccessException("Comment does not belong to your organization");
        }

        boolean isOwnerOrAdmin = role == Role.OWNER || role == Role.ADMIN;
        boolean isAuthor = comment.getAuthor().getId().equals(userId);

        if (!isAuthor && !isOwnerOrAdmin) {
            throw new UnauthorizedAccessException("You can only edit your own comments");
        }

        comment.setContent(request.getContent());
        return commentMapper.toResponse(commentRepository.save(comment));
    }

    @Transactional
    public void deleteComment(UUID commentId, UUID userId, Role role) {
        UUID orgId = UUID.fromString(TenantContext.getCurrentOrgId());

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        if (!comment.getOrganization().getId().equals(orgId)) {
            throw new UnauthorizedAccessException("Comment does not belong to your organization");
        }

        boolean isOwnerOrAdmin = role == Role.OWNER || role == Role.ADMIN;
        boolean isAuthor = comment.getAuthor().getId().equals(userId);

        if (!isAuthor && !isOwnerOrAdmin) {
            throw new UnauthorizedAccessException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }
}