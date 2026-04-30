package com.smartguys.mediclinic.controller;

import com.smartguys.mediclinic.dto.request.LabReportRequest;
import com.smartguys.mediclinic.dto.response.LabReportResponse;
import com.smartguys.mediclinic.model.enums.ReportType;
import com.smartguys.mediclinic.service.LabReportService;
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
@RequestMapping("/api/patients/{patientId}/lab-reports")
@Tag(name = "Lab Reports", description = "Laboratory report management operations")
public class LabReportController {
    
    @Autowired
    private LabReportService labReportService;
    
    @PostMapping
    @Operation(summary = "Create lab report", description = "Creates a new laboratory report for a patient")
    @ApiResponse(responseCode = "201", description = "Lab report created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input data")
    @ApiResponse(responseCode = "404", description = "Patient not found")
    public ResponseEntity<LabReportResponse> createLabReport(
            @PathVariable String patientId,
            @Valid @RequestBody LabReportRequest request) {
        
        LabReportResponse response = labReportService.createLabReport(patientId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update lab report", description = "Updates an existing laboratory report")
    @ApiResponse(responseCode = "200", description = "Lab report updated successfully")
    @ApiResponse(responseCode = "404", description = "Patient or lab report not found")
    @ApiResponse(responseCode = "400", description = "Invalid input data")
    public ResponseEntity<LabReportResponse> updateLabReport(
            @PathVariable String patientId,
            @PathVariable String id,
            @Valid @RequestBody LabReportRequest request) {
        
        LabReportResponse response = labReportService.updateLabReport(patientId, id, request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    @Operation(summary = "Get lab reports by patient", description = "Retrieves laboratory reports for a patient with optional type filter")
    @ApiResponse(responseCode = "200", description = "Lab reports retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Patient not found")
    public ResponseEntity<List<LabReportResponse>> getLabReportsByPatient(
            @PathVariable String patientId,
            @RequestParam(required = false) ReportType reportType) {
        
        List<LabReportResponse> reports = labReportService.getLabReportsByPatient(patientId, reportType);
        return ResponseEntity.ok(reports);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get lab report by ID", description = "Retrieves a specific laboratory report")
    @ApiResponse(responseCode = "200", description = "Lab report found")
    @ApiResponse(responseCode = "404", description = "Patient or lab report not found")
    public ResponseEntity<LabReportResponse> getLabReportById(
            @PathVariable String patientId,
            @PathVariable String id) {
        
        LabReportResponse response = labReportService.getLabReportById(patientId, id);
        return ResponseEntity.ok(response);
    }
}