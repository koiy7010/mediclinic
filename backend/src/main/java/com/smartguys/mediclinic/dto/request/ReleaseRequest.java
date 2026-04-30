package com.smartguys.mediclinic.dto.request;

import com.smartguys.mediclinic.model.enums.ReceiverType;
import com.smartguys.mediclinic.model.enums.ReleaseMethod;
import lombok.Data;

@Data
public class ReleaseRequest {
    
    private ReleaseMethod releaseMethod;
    
    private String receivedBy;
    
    private ReceiverType receiverType;
}