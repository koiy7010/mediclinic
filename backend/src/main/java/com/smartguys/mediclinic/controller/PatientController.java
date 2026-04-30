package com.smartguys.mediclinic.controller;

import com.smartguys.mediclinic.dto.request.PatientRequest;
import com.smartguys.mediclinic.dto.response.PagedResponse;
import com.smartguys.mediclinic.dto.response.PatientResponse;
import com.smartguys.mediclinic.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
@Tag(name = "Patients", description = "Patient management operations")
public class PatientController {
    
    @Autowired
    private PatientService patientService;
    
    @PostMapping
    @Operation(summary = "Create a new patient", description = "Creates a new patient record")
    @ApiResponse(responseCode = "201", description = "Patient created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input data")
    public ResponseEntity<PatientResponse> createPatient(@Valid @RequestBody PatientRequest request) {
        PatientResponse response = patientService.createPatient(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get patient by ID", description = "Retrieves a patient by their ID")
    @ApiResponse(responseCode = "200", description = "Patient found")
    @ApiResponse(responseCode = "404", description = "Patient not found")
    public ResponseEntity<PatientResponse> getPatientById(@PathVariable String id) {
        PatientResponse response = patientService.getPatientById(id);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update patient", description = "Updates an existing patient record")
    @ApiResponse(responseCode = "200", description = "Patient updated successfully")
    @ApiResponse(responseCode = "404", description = "Patient not found")
    @ApiResponse(responseCode = "400", description = "Invalid input data")
    public ResponseEntity<PatientResponse> updatePatient(@PathVariable String id, @Valid @RequestBody PatientRequest request) {
        PatientResponse response = patientService.updatePatient(id, request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    @Operation(summary = "List patients", description = "Retrieves a paginated list of patients with optional search")
    @ApiResponse(responseCode = "200", description = "Patients retrieved successfully")
    public ResponseEntity<PagedResponse<PatientResponse>> listPatients(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        
        Page<PatientResponse> page = patientService.listPatients(search, pageable);
        
        PagedResponse<PatientResponse> response = new PagedResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
        
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete patient", description = "Deletes a patient record")
    @ApiResponse(responseCode = "204", description = "Patient deleted successfully")
    @ApiResponse(responseCode = "404", description = "Patient not found")
    @ApiResponse(responseCode = "409", description = "Cannot delete patient with associated reports")
    public ResponseEntity<Void> deletePatient(@PathVariable String id) {
        patientService.deletePatient(id);
        return ResponseEntity.noContent().build();
    }
}