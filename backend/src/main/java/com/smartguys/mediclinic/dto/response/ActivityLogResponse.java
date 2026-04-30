package com.smartguys.mediclinic.dto.response;

import com.smartguys.mediclinic.model.enums.ActionType;
import com.smartguys.mediclinic.model.enums.ModuleType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ActivityLogResponse {
    private String id;
    private LocalDateTime timestamp;
    private ActionType action;
    private ModuleType module;
    private String patientName;
    private String patientId;
    private String details;
    private String user;
    private LocalDateTime createdAt;
}