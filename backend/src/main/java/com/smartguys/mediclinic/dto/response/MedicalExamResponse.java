package com.smartguys.mediclinic.dto.response;

import com.smartguys.mediclinic.model.embedded.Evaluation;
import com.smartguys.mediclinic.model.embedded.LabDiagnosticSummary;
import com.smartguys.mediclinic.model.embedded.PastMedicalHistory;
import com.smartguys.mediclinic.model.embedded.PhysicalExamination;
import com.smartguys.mediclinic.model.enums.BmiClassification;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class MedicalExamResponse {
    private String id;
    private String patientId;
    private LocalDate resultDate;
    private Double height;
    private Double weight;
    private Double bmi;
    private BmiClassification bmiClassification;
    private String saNo;
    private PastMedicalHistory pastMedicalHistory;
    private PhysicalExamination physicalExamination;
    private LabDiagnosticSummary labDiagnosticSummary;
    private Evaluation evaluation;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}