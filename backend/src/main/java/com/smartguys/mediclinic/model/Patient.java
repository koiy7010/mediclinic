package com.smartguys.mediclinic.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.TextIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Document(collection = "patients")
public class Patient {
    
    @Id
    private String id;
    
    private LocalDate registrationDate;
    
    @TextIndexed
    private String lastName;
    
    @TextIndexed
    private String firstName;
    
    private String middleName;
    
    private String address;
    
    private String contactNumber;
    
    @TextIndexed
    private String employer;
    
    private LocalDate birthdate;
    
    private String maritalStatus;
    
    private String gender;
    
    private String nationality;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}