package com.ark.Multi_tenant_api.config;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class MetricsService {

    private final Counter tasksCreatedTotal;
    private final Counter tasksCompletedTotal;
    private final Timer taskCompletionDuration;

    public MetricsService(MeterRegistry registry) {
        this.tasksCreatedTotal = Counter.builder("tasks_created_total")
                .description("Total number of tasks created")
                .register(registry);

        this.tasksCompletedTotal = Counter.builder("tasks_completed_total")
                .description("Total number of tasks completed")
                .register(registry);

        this.taskCompletionDuration = Timer.builder("task_completion_duration_seconds")
                .description("Time taken from task start to completion")
                .register(registry);
    }

    public void recordTaskCreated() {
        tasksCreatedTotal.increment();
    }

    public void recordTaskCompleted(LocalDateTime startedAt) {
        tasksCompletedTotal.increment();
        if (startedAt != null) {
            long seconds = Duration.between(startedAt, LocalDateTime.now()).getSeconds();
            taskCompletionDuration.record(Duration.ofSeconds(seconds));
        }
    }
}