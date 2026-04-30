package com.smartguys.mediclinic.model.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum ReleaseMethod {
    PICKUP("pickup"),
    EMAIL("email"),
    PORTAL("portal");

    private final String value;

    ReleaseMethod(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}