package com.smartguys.mediclinic.model.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum ActionType {
    CREATED("created"),
    UPDATED("updated"),
    VIEWED("viewed"),
    SAVED("saved"),
    QUEUED("queued"),
    RELEASED("released"),
    STATUS_CHANGED("status-changed");

    private final String value;

    ActionType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}