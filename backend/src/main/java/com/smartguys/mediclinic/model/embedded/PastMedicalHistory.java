package com.smartguys.mediclinic.model.embedded;

import lombok.Data;

@Data
public class PastMedicalHistory {
    private String allergies;
    private String medications;
    private String surgeries;
    private String illnesses;
    private String familyHistory;
    private String socialHistory;
}