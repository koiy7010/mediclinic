package com.smartguys.mediclinic.controller;

import com.smartguys.mediclinic.dto.request.ActivityLogRequest;
import com.smartguys.mediclinic.dto.response.ActivityLogResponse;
import com.smartguys.mediclinic.dto.response.PagedResponse;
import com.smartguys.mediclinic.model.ActivityLog;
import com.smartguys.mediclinic.model.enums.ActionType;
import com.smartguys.mediclinic.model.enums.ModuleType;
import com.smartguys.mediclinic.service.ActivityLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/activity-logs")
@Tag(name = "Activity Logs", description = "System activity log operations")
public class ActivityLogController {
    
    private final ActivityLogService activityLogService;
    
    public ActivityLogController(ActivityLogService activityLogService) {
        this.activityLogService = activityLogService;
    }
    
    @PostMapping
    @Operation(summary = "Create activity log", description = "Manually records an activity log entry")
    @ApiResponse(responseCode = "201", description = "Activity log created")
    public ResponseEntity<ActivityLogResponse> createActivityLog(@RequestBody ActivityLogRequest request) {
        ActivityLog log = new ActivityLog();
        log.setTimestamp(LocalDateTime.now());
        log.setCreatedAt(LocalDateTime.now());
        log.setPatientId(request.getPatientId());
        log.setPatientName(request.getPatientName());
        log.setDetails(request.getDetails());
        log.setUser(request.getUser() != null ? request.getUser() : "system");

        try {
            log.setAction(ActionType.valueOf(request.getAction().toUpperCase()));
        } catch (Exception e) {
            log.setAction(ActionType.UPDATED);
        }
        try {
            log.setModule(ModuleType.valueOf(request.getModule().toUpperCase().replace("-", "_").replace(" ", "_")));
        } catch (Exception e) {
            log.setModule(ModuleType.LABORATORY);
        }

        activityLogService.saveActivityLog(log);

        ActivityLogResponse response = new ActivityLogResponse();
        BeanUtils.copyProperties(log, response);
        return ResponseEntity.status(201).body(response);
    }

    @GetMapping
    @Operation(summary = "Get activity logs", description = "Retrieves activity logs with optional filters")
    @ApiResponse(responseCode = "200", description = "Activity logs retrieved successfully")
    public ResponseEntity<PagedResponse<ActivityLogResponse>> getActivityLogs(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) ModuleType module,
            @RequestParam(required = false) ActionType action,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        
        Page<com.smartguys.mediclinic.model.ActivityLog> page;
        
        if (startDate != null && endDate != null) {
            page = activityLogService.getActivityLogsByDateRange(startDate, endDate, pageable);
        } else if (module != null) {
            page = activityLogService.getActivityLogsByModule(module, pageable);
        } else if (action != null) {
            page = activityLogService.getActivityLogsByAction(action, pageable);
        } else if (search != null && !search.trim().isEmpty()) {
            page = activityLogService.searchActivityLogs(search.trim(), pageable);
        } else {
            page = activityLogService.getActivityLogs(pageable);
        }
        
        Page<ActivityLogResponse> responsePage = page.map(log -> {
            ActivityLogResponse response = new ActivityLogResponse();
            BeanUtils.copyProperties(log, response);
            return response;
        });
        
        PagedResponse<ActivityLogResponse> response = new PagedResponse<>(
                responsePage.getContent(),
                responsePage.getNumber(),
                responsePage.getSize(),
                responsePage.getTotalElements(),
                responsePage.getTotalPages(),
                responsePage.isFirst(),
                responsePage.isLast()
        );
        
        return ResponseEntity.ok(response);
    }
}