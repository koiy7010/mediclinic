package com.smartguys.mediclinic.dto.response;

import com.smartguys.mediclinic.model.embedded.ReportReference;
import com.smartguys.mediclinic.model.enums.ReceiverType;
import com.smartguys.mediclinic.model.enums.ReleaseMethod;
import com.smartguys.mediclinic.model.enums.ReleaseStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ReleaseRecordResponse {
    private String id;
    private String patientId;
    private String patientName;
    private String employer;
    private List<ReportReference> reports;
    private ReleaseStatus status;
    private ReleaseMethod releaseMethod;
    private LocalDateTime releasedAt;
    private String receivedBy;
    private ReceiverType receiverType;
    private String claimNo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}