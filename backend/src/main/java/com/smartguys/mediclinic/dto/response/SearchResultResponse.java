package com.smartguys.mediclinic.dto.response;

import lombok.Data;

import java.time.LocalDate;
import java.util.Map;

@Data
public class SearchResultResponse {
    private String id;
    private String lastName;
    private String firstName;
    private String middleName;
    private String employer;
    private LocalDate registrationDate;
    private Map<String, Boolean> reportAvailability; // reportType -> exists
}