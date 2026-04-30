package com.smartguys.mediclinic.controller;

import com.smartguys.mediclinic.dto.request.EcgReportRequest;
import com.smartguys.mediclinic.dto.response.EcgReportResponse;
import com.smartguys.mediclinic.service.EcgReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients/{patientId}/ecg-reports")
@Tag(name = "ECG Reports", description = "ECG report management operations")
public class EcgReportController {
    
    private final EcgReportService ecgReportService;
    
    public EcgReportController(EcgReportService ecgReportService) {
        this.ecgReportService = ecgReportService;
    }
    
    @PostMapping
    @Operation(summary = "Create ECG report", description = "Creates a new ECG report for a patient")
    @ApiResponse(responseCode = "201", description = "ECG report created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input data")
    @ApiResponse(responseCode = "404", description = "Patient not found")
    public ResponseEntity<EcgReportResponse> createEcgReport(
            @PathVariable String patientId,
            @Valid @RequestBody EcgReportRequest request) {
        
        EcgReportResponse response = ecgReportService.createEcgReport(patientId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update ECG report", description = "Updates an existing ECG report")
    @ApiResponse(responseCode = "200", description = "ECG report updated successfully")
    @ApiResponse(responseCode = "404", description = "Patient or ECG report not found")
    @ApiResponse(responseCode = "400", description = "Invalid input data")
    public ResponseEntity<EcgReportResponse> updateEcgReport(
            @PathVariable String patientId,
            @PathVariable String id,
            @Valid @RequestBody EcgReportRequest request) {
        
        EcgReportResponse response = ecgReportService.updateEcgReport(patientId, id, request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    @Operation(summary = "Get ECG reports by patient", description = "Retrieves ECG reports for a patient")
    @ApiResponse(responseCode = "200", description = "ECG reports retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Patient not found")
    public ResponseEntity<List<EcgReportResponse>> getEcgReportsByPatient(@PathVariable String patientId) {
        List<EcgReportResponse> reports = ecgReportService.getEcgReportsByPatient(patientId);
        return ResponseEntity.ok(reports);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get ECG report by ID", description = "Retrieves a specific ECG report")
    @ApiResponse(responseCode = "200", description = "ECG report found")
    @ApiResponse(responseCode = "404", description = "Patient or ECG report not found")
    public ResponseEntity<EcgReportResponse> getEcgReportById(
            @PathVariable String patientId,
            @PathVariable String id) {
        
        EcgReportResponse response = ecgReportService.getEcgReportById(patientId, id);
        return ResponseEntity.ok(response);
    }
}