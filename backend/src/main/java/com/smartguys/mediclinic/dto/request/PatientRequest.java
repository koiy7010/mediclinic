package com.smartguys.mediclinic.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PatientRequest {
    
    private LocalDate registrationDate;
    
    @NotBlank(message = "Last name is required")
    private String lastName;
    
    @NotBlank(message = "First name is required")
    private String firstName;
    
    private String middleName;
    
    private String address;
    
    private String contactNumber;
    
    private String employer;
    
    private LocalDate birthdate;
    
    private String maritalStatus;
    
    private String gender;
    
    private String nationality;
}