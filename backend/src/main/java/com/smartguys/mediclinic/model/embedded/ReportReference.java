package com.smartguys.mediclinic.model.embedded;

import lombok.Data;

@Data
public class ReportReference {
    private String reportId;
    private String reportType;
    private String reportTitle;
    private Boolean done;
}