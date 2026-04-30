package com.smartguys.mediclinic.controller;

import com.smartguys.mediclinic.dto.request.UtzReportRequest;
import com.smartguys.mediclinic.dto.response.UtzReportResponse;
import com.smartguys.mediclinic.service.UtzReportService;
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
@RequestMapping("/api/patients/{patientId}/utz-reports")
@Tag(name = "UTZ Reports", description = "UTZ report management operations")
public class UtzReportController {
    
    @Autowired
    private UtzReportService utzReportService;
    
    @PostMapping
    @Operation(summary = "Create UTZ report", description = "Creates a new UTZ report for a patient")
    @ApiResponse(responseCode = "201", description = "UTZ report created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input data")
    @ApiResponse(responseCode = "404", description = "Patient not found")
    public ResponseEntity<UtzReportResponse> createUtzReport(
            @PathVariable String patientId,
            @Valid @RequestBody UtzReportRequest request) {
        
        UtzReportResponse response = utzReportService.createUtzReport(patientId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update UTZ report", description = "Updates an existing UTZ report")
    @ApiResponse(responseCode = "200", description = "UTZ report updated successfully")
    @ApiResponse(responseCode = "404", description = "Patient or UTZ report not found")
    @ApiResponse(responseCode = "400", description = "Invalid input data")
    public ResponseEntity<UtzReportResponse> updateUtzReport(
            @PathVariable String patientId,
            @PathVariable String id,
            @Valid @RequestBody UtzReportRequest request) {
        
        UtzReportResponse response = utzReportService.updateUtzReport(patientId, id, request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    @Operation(summary = "Get UTZ reports by patient", description = "Retrieves UTZ reports for a patient")
    @ApiResponse(responseCode = "200", description = "UTZ reports retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Patient not found")
    public ResponseEntity<List<UtzReportResponse>> getUtzReportsByPatient(@PathVariable String patientId) {
        List<UtzReportResponse> reports = utzReportService.getUtzReportsByPatient(patientId);
        return ResponseEntity.ok(reports);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get UTZ report by ID", description = "Retrieves a specific UTZ report")
    @ApiResponse(responseCode = "200", description = "UTZ report found")
    @ApiResponse(responseCode = "404", description = "Patient or UTZ report not found")
    public ResponseEntity<UtzReportResponse> getUtzReportById(
            @PathVariable String patientId,
            @PathVariable String id) {
        
        UtzReportResponse response = utzReportService.getUtzReportById(patientId, id);
        return ResponseEntity.ok(response);
    }
}