package com.smartguys.mediclinic.controller;

import com.smartguys.mediclinic.dto.request.QueueEntryRequest;
import com.smartguys.mediclinic.dto.request.StatusUpdateRequest;
import com.smartguys.mediclinic.dto.response.PagedResponse;
import com.smartguys.mediclinic.dto.response.QueueEntryResponse;
import com.smartguys.mediclinic.model.enums.QueueStatus;
import com.smartguys.mediclinic.service.QueueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/queue")
@Tag(name = "Queue Management", description = "Patient queue management operations")
public class QueueController {
    
    @Autowired
    private QueueService queueService;
    
    @PostMapping
    @Operation(summary = "Create queue entry", description = "Adds a patient to the queue")
    @ApiResponse(responseCode = "201", description = "Queue entry created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input data")
    public ResponseEntity<QueueEntryResponse> createQueueEntry(@Valid @RequestBody QueueEntryRequest request) {
        QueueEntryResponse response = queueService.createQueueEntry(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PatchMapping("/{id}/status")
    @Operation(summary = "Update queue status", description = "Updates the status of a queue entry")
    @ApiResponse(responseCode = "200", description = "Queue status updated successfully")
    @ApiResponse(responseCode = "404", description = "Queue entry not found")
    @ApiResponse(responseCode = "400", description = "Invalid status")
    public ResponseEntity<QueueEntryResponse> updateQueueStatus(
            @PathVariable String id,
            @Valid @RequestBody StatusUpdateRequest request) {
        
        QueueEntryResponse response = queueService.updateQueueStatus(id, request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    @Operation(summary = "List queue entries", description = "Retrieves queue entries with optional filters")
    @ApiResponse(responseCode = "200", description = "Queue entries retrieved successfully")
    public ResponseEntity<PagedResponse<QueueEntryResponse>> listQueueEntries(
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now()}") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) QueueStatus status,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        
        Page<QueueEntryResponse> page = queueService.listQueueEntries(date, status, search, pageable);
        
        PagedResponse<QueueEntryResponse> response = new PagedResponse<>(
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
    
    @DeleteMapping("/completed")
    @Operation(summary = "Remove completed entries", description = "Removes all completed queue entries for the current day")
    @ApiResponse(responseCode = "200", description = "Completed entries removed successfully")
    public ResponseEntity<Map<String, Integer>> removeCompletedEntries(
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now()}") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        int count = queueService.removeCompletedEntries(date);
        return ResponseEntity.ok(Map.of("removedCount", count));
    }
}