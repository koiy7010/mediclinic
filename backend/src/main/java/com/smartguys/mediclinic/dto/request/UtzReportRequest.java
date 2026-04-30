package com.smartguys.mediclinic.dto.request;

import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UtzReportRequest {
    
    private String reportTitle;
    
    @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "Result date must be in ISO format (yyyy-MM-dd)")
    private String resultDate;
    
    private String examinationType;
    
    private String utzNo;
    
    private String findings;
    
    private String impression;
    
    private Boolean isNormal;
}