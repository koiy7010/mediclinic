package com.smartguys.mediclinic.controller;

import com.smartguys.mediclinic.dto.request.RadiologyReportRequest;
import com.smartguys.mediclinic.dto.response.RadiologyReportResponse;
import com.smartguys.mediclinic.service.RadiologyReportService;
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
@RequestMapping("/api/patients/{patientId}/xray-reports")
@Tag(name = "X-Ray Reports", description = "Radiology report management operations")
public class RadiologyReportController {
    
    @Autowired
    private RadiologyReportService radiologyReportService;
    
    @PostMapping
    @Operation(summary = "Create X-Ray report", description = "Creates a new radiology report for a patient")
    @ApiResponse(responseCode = "201", description = "X-Ray report created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input data")
    @ApiResponse(responseCode = "404", description = "Patient not found")
    public ResponseEntity<RadiologyReportResponse> createRadiologyReport(
            @PathVariable String patientId,
            @Valid @RequestBody RadiologyReportRequest request) {
        
        RadiologyReportResponse response = radiologyReportService.createRadiologyReport(patientId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update X-Ray report", description = "Updates an existing radiology report")
    @ApiResponse(responseCode = "200", description = "X-Ray report updated successfully")
    @ApiResponse(responseCode = "404", description = "Patient or X-Ray report not found")
    @ApiResponse(responseCode = "400", description = "Invalid input data")
    public ResponseEntity<RadiologyReportResponse> updateRadiologyReport(
            @PathVariable String patientId,
            @PathVariable String id,
            @Valid @RequestBody RadiologyReportRequest request) {
        
        RadiologyReportResponse response = radiologyReportService.updateRadiologyReport(patientId, id, request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    @Operation(summary = "Get X-Ray reports by patient", description = "Retrieves radiology reports for a patient")
    @ApiResponse(responseCode = "200", description = "X-Ray reports retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Patient not found")
    public ResponseEntity<List<RadiologyReportResponse>> getRadiologyReportsByPatient(@PathVariable String patientId) {
        List<RadiologyReportResponse> reports = radiologyReportService.getRadiologyReportsByPatient(patientId);
        return ResponseEntity.ok(reports);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get X-Ray report by ID", description = "Retrieves a specific radiology report")
    @ApiResponse(responseCode = "200", description = "X-Ray report found")
    @ApiResponse(responseCode = "404", description = "Patient or X-Ray report not found")
    public ResponseEntity<RadiologyReportResponse> getRadiologyReportById(
            @PathVariable String patientId,
            @PathVariable String id) {
        
        RadiologyReportResponse response = radiologyReportService.getRadiologyReportById(patientId, id);
        return ResponseEntity.ok(response);
    }
}