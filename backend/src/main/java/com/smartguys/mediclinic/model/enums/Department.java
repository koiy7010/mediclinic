package com.smartguys.mediclinic.model.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum Department {
    LABORATORY("laboratory"),
    MEDICAL_EXAM("medical-exam"),
    XRAY("xray"),
    UTZ("utz"),
    ECG("ecg");

    private final String value;

    Department(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}