package com.smartguys.mediclinic.controller;

import com.smartguys.mediclinic.dto.response.SearchResultResponse;
import com.smartguys.mediclinic.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@Tag(name = "Global Search", description = "Global patient search operations")
public class SearchController {
    
    @Autowired
    private SearchService searchService;
    
    @GetMapping
    @Operation(summary = "Global patient search", description = "Searches for patients across multiple fields with report availability")
    @ApiResponse(responseCode = "200", description = "Search results retrieved successfully")
    public ResponseEntity<List<SearchResultResponse>> globalSearch(@RequestParam String q) {
        List<SearchResultResponse> results = searchService.globalSearch(q);
        return ResponseEntity.ok(results);
    }
}