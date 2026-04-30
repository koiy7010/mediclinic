package com.smartguys.mediclinic.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Document(collection = "ecg_reports")
public class EcgReport {
    
    @Id
    private String id;
    
    @Indexed
    private String patientId;
    
    private String reportTitle;
    
    private LocalDate resultDate;
    
    private String examinationType;
    
    private String ecgNo;
    
    private String findings;
    
    private String impression;
    
    private Boolean isNormal;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}