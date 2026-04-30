package com.smartguys.mediclinic.model.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum ModuleType {
    INFORMATION_DESK("Information_Desk"),
    PATIENT_PROFILE("Patient_Profile"),
    LABORATORY("Laboratory"),
    MEDICAL_EXAM("Medical_Exam"),
    X_RAY("X_Ray"),
    UTZ("UTZ"),
    ECG("ECG"),
    RELEASING("Releasing");

    private final String value;

    ModuleType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}