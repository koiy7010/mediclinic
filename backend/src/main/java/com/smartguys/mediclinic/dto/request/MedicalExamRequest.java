package com.smartguys.mediclinic.dto.request;

import com.smartguys.mediclinic.model.embedded.Evaluation;
import com.smartguys.mediclinic.model.embedded.LabDiagnosticSummary;
import com.smartguys.mediclinic.model.embedded.PastMedicalHistory;
import com.smartguys.mediclinic.model.embedded.PhysicalExamination;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class MedicalExamRequest {
    
    @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "Result date must be in ISO format (yyyy-MM-dd)")
    private String resultDate;
    
    private Double height;
    
    private Double weight;
    
    private String saNo;
    
    private PastMedicalHistory pastMedicalHistory;
    
    private PhysicalExamination physicalExamination;
    
    private LabDiagnosticSummary labDiagnosticSummary;
    
    private Evaluation evaluation;
}