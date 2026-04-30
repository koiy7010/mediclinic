package com.smartguys.mediclinic.model;

import com.smartguys.mediclinic.model.enums.ReportType;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Document(collection = "lab_reports")
@CompoundIndex(def = "{'patientId': 1, 'reportType': 1}")
public class LabReport {
    
    @Id
    private String id;
    
    @Indexed
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