package com.smartguys.mediclinic.model;

import com.smartguys.mediclinic.model.embedded.Evaluation;
import com.smartguys.mediclinic.model.embedded.LabDiagnosticSummary;
import com.smartguys.mediclinic.model.embedded.PastMedicalHistory;
import com.smartguys.mediclinic.model.embedded.PhysicalExamination;
import com.smartguys.mediclinic.model.enums.BmiClassification;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Document(collection = "medical_exams")
public class MedicalExam {
    
    @Id
    private String id;
    
    @Indexed
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