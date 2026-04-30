package com.smartguys.mediclinic.model.embedded;

import lombok.Data;

@Data
public class Evaluation {
    private String evaluationGrade;
    private String remarks;
    private String recommendations;
    private Boolean forClearance;
}