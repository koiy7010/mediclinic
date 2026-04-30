package com.smartguys.mediclinic.model;

import com.smartguys.mediclinic.model.enums.ActionType;
import com.smartguys.mediclinic.model.enums.ModuleType;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.IndexDirection;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "activity_logs")
@CompoundIndex(def = "{'module': 1, 'action': 1}")
public class ActivityLog {
    
    @Id
    private String id;
    
    @Indexed(direction = IndexDirection.DESCENDING)
    private LocalDateTime timestamp;
    
    private ActionType action;
    
    private ModuleType module;
    
    private String patientName;
    
    private String patientId;
    
    private String details;
    
    private String user;
    
    private LocalDateTime createdAt;
}