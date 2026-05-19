package com.ark.Multi_tenant_api.domain.task;

import com.ark.Multi_tenant_api.exception.InvalidStatusTransitionException;

import java.util.EnumMap;
import java.util.Map;
import java.util.Set;

public class TaskStatusTransitionValidator {

    private static final Map<TaskStatus, Set<TaskStatus>> VALID_TRANSITIONS =
            new EnumMap<>(TaskStatus.class);

    static {
        VALID_TRANSITIONS.put(TaskStatus.TODO, Set.of(
                TaskStatus.IN_PROGRESS
        ));
        VALID_TRANSITIONS.put(TaskStatus.IN_PROGRESS, Set.of(
                TaskStatus.IN_REVIEW,
                TaskStatus.TODO
        ));
        VALID_TRANSITIONS.put(TaskStatus.IN_REVIEW, Set.of(
                TaskStatus.DONE,
                TaskStatus.IN_PROGRESS,
                TaskStatus.TODO
        ));
        VALID_TRANSITIONS.put(TaskStatus.DONE, Set.of(
                TaskStatus.TODO
        ));
    }

    public static void validate(TaskStatus from, TaskStatus to) {
        Set<TaskStatus> validNext = VALID_TRANSITIONS.get(from);
        if (validNext == null || !validNext.contains(to)) {
            throw new InvalidStatusTransitionException(
                    "Invalid transition from " + from + " to " + to
            );
        }
    }
}