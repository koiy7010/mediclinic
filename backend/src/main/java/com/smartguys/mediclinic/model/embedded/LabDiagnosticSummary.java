package com.smartguys.mediclinic.model.embedded;

import lombok.Data;

@Data
public class LabDiagnosticSummary {
    private String urinalysis;
    private String hematology;
    private String chemistry;
    private String serology;
    private String fecalysis;
    private String xray;
    private String ecg;
    private String utz;
}