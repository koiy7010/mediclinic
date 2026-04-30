package com.smartguys.mediclinic.dto.response;

import com.smartguys.mediclinic.model.enums.Department;
import com.smartguys.mediclinic.model.enums.QueueStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class QueueEntryResponse {
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