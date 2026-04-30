package com.smartguys.mediclinic.controller;

import com.smartguys.mediclinic.dto.request.MedicalExamRequest;
import com.smartguys.mediclinic.dto.response.MedicalExamResponse;
import com.smartguys.mediclinic.service.MedicalExamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients/{patientId}/medical-exams")
@Tag(name = "Medical Exams", description = "Medical examination management operations")
public class MedicalExamController {
    
    @Autowired
    private MedicalExamService medicalExamService;
    
    @PostMapping
    @Operation(summary = "Create medical exam", description = "Creates a new medical examination for a patient")
    @ApiResponse(responseCode = "201", description = "Medical exam created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input data")
    @ApiResponse(responseCode = "404", description = "Patient not found")
    public ResponseEntity<MedicalExamResponse> createMedicalExam(
            @PathVariable String patientId,
            @Valid @RequestBody MedicalExamRequest request) {
        
        MedicalExamResponse response = medicalExamService.createMedicalExam(patientId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update medical exam", description = "Updates an existing medical examination")
    @ApiResponse(responseCode = "200", description = "Medical exam updated successfully")
    @ApiResponse(responseCode = "404", description = "Patient or medical exam not found")
    @ApiResponse(responseCode = "400", description = "Invalid input data")
    public ResponseEntity<MedicalExamResponse> updateMedicalExam(
            @PathVariable String patientId,
            @PathVariable String id,
            @Valid @RequestBody MedicalExamRequest request) {
        
        MedicalExamResponse response = medicalExamService.updateMedicalExam(patientId, id, request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    @Operation(summary = "Get medical exams by patient", description = "Retrieves medical examinations for a patient")
    @ApiResponse(responseCode = "200", description = "Medical exams retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Patient not found")
    public ResponseEntity<List<MedicalExamResponse>> getMedicalExamsByPatient(@PathVariable String patientId) {
        List<MedicalExamResponse> exams = medicalExamService.getMedicalExamsByPatient(patientId);
        return ResponseEntity.ok(exams);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get medical exam by ID", description = "Retrieves a specific medical examination")
    @ApiResponse(responseCode = "200", description = "Medical exam found")
    @ApiResponse(responseCode = "404", description = "Patient or medical exam not found")
    public ResponseEntity<MedicalExamResponse> getMedicalExamById(
            @PathVariable String patientId,
            @PathVariable String id) {
        
        MedicalExamResponse response = medicalExamService.getMedicalExamById(patientId, id);
        return ResponseEntity.ok(response);
    }
}