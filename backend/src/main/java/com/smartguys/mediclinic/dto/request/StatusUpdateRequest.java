package com.smartguys.mediclinic.dto.request;

import com.smartguys.mediclinic.model.enums.QueueStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StatusUpdateRequest {
    
    @NotNull(message = "Status is required")
    private QueueStatus status;
}