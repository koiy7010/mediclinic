package com.smartguys.mediclinic.dto.response;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class RadiologyReportResponse {
    private String id;
    private String patientId;
    private String reportTitle;
    private LocalDate resultDate;
    private String examinationType;
    private String xrayNo;
    private String findings;
    private String impression;
    private Boolean isNormal;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}