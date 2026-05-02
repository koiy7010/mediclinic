package com.smartguys.mediclinic.dto.request;

import lombok.Data;

@Data
public class ActivityLogRequest {
    private String action;
    private String module;
    private String patientId;
    private String patientName;
    private String details;
    private String user;
}
