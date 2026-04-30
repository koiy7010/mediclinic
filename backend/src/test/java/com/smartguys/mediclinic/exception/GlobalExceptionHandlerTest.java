package com.smartguys.mediclinic.exception;

import com.smartguys.mediclinic.dto.response.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {
    
    private GlobalExceptionHandler globalExceptionHandler;
    
    @Mock
    private HttpServletRequest request;
    
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        globalExceptionHandler = new GlobalExceptionHandler();
        when(request.getRequestURI()).thenReturn("/api/test");
    }
    
    @Test
    void testHandleResourceNotFoundException() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Patient not found");
        
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleResourceNotFoundException(ex, request);
        
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Patient not found", response.getBody().getMessage());
        assertEquals("Resource Not Found", response.getBody().getError());
        assertEquals("/api/test", response.getBody().getPath());
    }
    
    @Test
    void testHandleValidationException() {
        ValidationException ex = new ValidationException("Invalid data");
        
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleValidationException(ex, request);
        
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid data", response.getBody().getMessage());
        assertEquals("Validation Error", response.getBody().getError());
    }
    
    @Test
    void testHandleConflictException() {
        ConflictException ex = new ConflictException("Cannot delete patient with reports");
        
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleConflictException(ex, request);
        
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("Cannot delete patient with reports", response.getBody().getMessage());
        assertEquals("Conflict", response.getBody().getError());
    }
    
    @Test
    void testHandleHttpMessageNotReadableException() {
        HttpMessageNotReadableException ex = new HttpMessageNotReadableException("Malformed JSON");
        
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleHttpMessageNotReadableException(ex, request);
        
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid JSON format or data type", response.getBody().getMessage());
        assertEquals("Malformed JSON", response.getBody().getError());
    }
    
    @Test
    void testHandleGenericException() {
        Exception ex = new RuntimeException("Unexpected error");
        
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleGenericException(ex, request);
        
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("An unexpected error occurred", response.getBody().getMessage());
        assertEquals("Internal Server Error", response.getBody().getError());
    }
}