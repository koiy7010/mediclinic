package com.smartguys.mediclinic.model.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum ReceiverType {
    PATIENT("patient"),
    REPRESENTATIVE("representative"),
    COMPANY("company");

    private final String value;

    ReceiverType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}