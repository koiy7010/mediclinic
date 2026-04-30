package com.smartguys.mediclinic.model.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum QueueStatus {
    WAITING("waiting"),
    IN_PROGRESS("in-progress"),
    DONE("done");

    private final String value;

    QueueStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}