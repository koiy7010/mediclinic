package com.smartguys.mediclinic.controller;

import com.smartguys.mediclinic.dto.request.ReleaseRequest;
import com.smartguys.mediclinic.dto.response.PagedResponse;
import com.smartguys.mediclinic.dto.response.ReleaseRecordResponse;
import com.smartguys.mediclinic.model.enums.ReleaseStatus;
import com.smartguys.mediclinic.service.ReleasingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/releasing")
@Tag(name = "Result Releasing", description = "Patient result releasing operations")
public class ReleasingController {
    
    private final ReleasingService releasingService;
    
    public ReleasingController(ReleasingService releasingService) {
        this.releasingService = releasingService;
    }
    
    @GetMapping
    @Operation(summary = "List release records", description = "Retrieves release records with optional filters")
    @ApiResponse(responseCode = "200", description = "Release records retrieved successfully")
    public ResponseEntity<PagedResponse<ReleaseRecordResponse>> listReleaseRecords(
            @RequestParam(required = false) ReleaseStatus status,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        
        Page<ReleaseRecordResponse> page = releasingService.listReleaseRecords(status, search, pageable);
        
        PagedResponse<ReleaseRecordResponse> response = new PagedResponse<>(
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
    
    @PostMapping("/{id}/release")
    @Operation(summary = "Release results", description = "Releases patient results and generates claim number")
    @ApiResponse(responseCode = "200", description = "Results released successfully")
    @ApiResponse(responseCode = "404", description = "Release record not found")
    @ApiResponse(responseCode = "409", description = "Cannot release incomplete results")
    public ResponseEntity<ReleaseRecordResponse> releaseResults(
            @PathVariable String id,
            @Valid @RequestBody ReleaseRequest request) {
        
        ReleaseRecordResponse response = releasingService.releaseResults(id, request);
        return ResponseEntity.ok(response);
    }
}