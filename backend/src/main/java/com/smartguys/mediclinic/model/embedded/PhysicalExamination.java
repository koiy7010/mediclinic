package com.smartguys.mediclinic.model.embedded;

import lombok.Data;

@Data
public class PhysicalExamination {
    private Double bpSystolic;
    private Double bpDiastolic;
    private Double pulseRate;
    private Double temperature;
    private Double respiration;
    private String generalAppearance;
    private String skin;
    private String head;
    private String eyes;
    private String ears;
    private String nose;
    private String mouth;
    private String neck;
    private String chest;
    private String heart;
    private String abdomen;
    private String extremities;
    private String neurological;
}