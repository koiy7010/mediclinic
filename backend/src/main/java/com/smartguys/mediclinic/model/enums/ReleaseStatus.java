package com.smartguys.mediclinic.model.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum ReleaseStatus {
    READY("ready"),
    RELEASED("released"),
    PENDING("pending");

    private final String value;

    ReleaseStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}