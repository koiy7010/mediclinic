package com.smartguys.mediclinic.model;

import com.smartguys.mediclinic.model.enums.Department;
import com.smartguys.mediclinic.model.enums.QueueStatus;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "queue_entries")
@CompoundIndex(def = "{'createdAt': 1, 'status': 1}")
public class QueueEntry {
    
    @Id
    private String id;
    
    private String patientId;
    
    private String patientName;
    
    private String employer;
    
    private Department department;
    
    private String purpose;
    
    private QueueStatus status;
    
    private Integer queueNumber;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}