package com.smartguys.mediclinic.model.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum ReportType {
    URINALYSIS("urinalysis"),
    HEMATOLOGY("hematology"),
    CHEM10("chem10"),
    HBA1C("hba1c"),
    SEROLOGY("serology"),
    FECALYSIS("fecalysis"),
    BLOOD_TYPING("blood-typing");

    private final String value;

    ReportType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}