package com.smartguys.mediclinic.model;

import com.smartguys.mediclinic.model.embedded.ReportReference;
import com.smartguys.mediclinic.model.enums.ReceiverType;
import com.smartguys.mediclinic.model.enums.ReleaseMethod;
import com.smartguys.mediclinic.model.enums.ReleaseStatus;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "release_records")
public class ReleaseRecord {
    
    @Id
    private String id;
    
    @Indexed
    private String patientId;
    
    private String patientName;
    
    private String employer;
    
    private List<ReportReference> reports;
    
    @Indexed
    private ReleaseStatus status;
    
    private ReleaseMethod releaseMethod;
    
    private LocalDateTime releasedAt;
    
    private String receivedBy;
    
    private ReceiverType receiverType;
    
    private String claimNo;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}