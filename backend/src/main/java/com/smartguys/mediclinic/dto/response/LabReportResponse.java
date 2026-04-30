package com.smartguys.mediclinic.dto.response;

import com.smartguys.mediclinic.model.enums.ReportType;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@Data
public class LabReportResponse {
    private String id;
    private String patientId;
    private ReportType reportType;
    private LocalDate resultDate;
    private Map<String, Object> data;
    private Boolean isNormal;
    private String remark;
    private Map<String, String> flags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}