package com.smartguys.mediclinic.dto.response;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class PatientResponse {
    private String id;
    private LocalDate registrationDate;
    private String lastName;
    private String firstName;
    private String middleName;
    private String address;
    private String contactNumber;
    private String employer;
    private LocalDate birthdate;
    private String maritalStatus;
    private String gender;
    private String nationality;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}