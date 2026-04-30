package com.smartguys.mediclinic.dto.request;

import com.smartguys.mediclinic.model.enums.Department;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class QueueEntryRequest {
    
    private String patientId;
    
    private String patientName;
    
    private String employer;
    
    private Department department;
    
    @NotBlank(message = "Purpose is required")
    private String purpose;
}