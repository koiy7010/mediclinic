package com.smartguys.mediclinic.model.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum BmiClassification {
    UNDERWEIGHT("Underweight"),
    NORMAL("Normal"),
    OVERWEIGHT("Overweight"),
    OBESE_I("Obese_I"),
    OBESE_II("Obese_II"),
    OBESE_III("Obese_III");

    private final String value;

    BmiClassification(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}