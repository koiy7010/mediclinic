package com.smartguys.mediclinic.dto.request;

import com.smartguys.mediclinic.model.enums.ReportType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.util.Map;

@Data
public class LabReportRequest {
    
    @NotNull(message = "Report type is required")
    private ReportType reportType;
    
    @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "Result date must be in ISO format (yyyy-MM-dd)")
    private String resultDate;
    
    private Map<String, Object> data;
    
    private Boolean isNormal;
    
    private String remark;
}