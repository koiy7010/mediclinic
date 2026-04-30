package com.smartguys.mediclinic.service;

import com.smartguys.mediclinic.annotation.Auditable;
import com.smartguys.mediclinic.dto.request.UtzReportRequest;
import com.smartguys.mediclinic.dto.response.UtzReportResponse;
import com.smartguys.mediclinic.exception.ResourceNotFoundException;
import com.smartguys.mediclinic.exception.ValidationException;
import com.smartguys.mediclinic.model.UtzReport;
import com.smartguys.mediclinic.model.enums.ActionType;
import com.smartguys.mediclinic.model.enums.ModuleType;
import com.smartguys.mediclinic.repository.PatientRepository;
import com.smartguys.mediclinic.repository.UtzReportRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UtzReportService {
    
    private final UtzReportRepository utzReportRepository;
    private final PatientRepository patientRepository;
    
    public UtzReportService(UtzReportRepository utzReportRepository, PatientRepository patientRepository) {
        this.utzReportRepository = utzReportRepository;
        this.patientRepository = patientRepository;
    }
    
    @Auditable(action = ActionType.CREATED, module = ModuleType.UTZ)
    public UtzReportResponse createUtzReport(String patientId, UtzReportRequest request) {
        // Validate patient exists
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient not found with id: " + patientId);
        }
        
        // Validate result date
        LocalDate resultDate = parseResultDate(request.getResultDate());
        
        UtzReport report = new UtzReport();
        BeanUtils.copyProperties(request, report, "resultDate");
        report.setPatientId(patientId);
        report.setResultDate(resultDate);
        
        LocalDateTime now = LocalDateTime.now();
        report.setCreatedAt(now);
        report.setUpdatedAt(now);
        
        UtzReport savedReport = utzReportRepository.save(report);
        
        UtzReportResponse response = new UtzReportResponse();
        BeanUtils.copyProperties(savedReport, response);
        return response;
    }
    
    @Auditable(action = ActionType.UPDATED, module = ModuleType.UTZ)
    public UtzReportResponse updateUtzReport(String patientId, String reportId, UtzReportRequest request) {
        // Validate patient exists
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient not found with id: " + patientId);
        }
        
        UtzReport existingReport = utzReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("UTZ report not found with id: " + reportId));
        
        // Validate report belongs to patient
        if (!existingReport.getPatientId().equals(patientId)) {
            throw new ValidationException("UTZ report does not belong to the specified patient");
        }
        
        // Validate result date
        LocalDate resultDate = parseResultDate(request.getResultDate());
        
        BeanUtils.copyProperties(request, existingReport, "id", "patientId", "createdAt", "resultDate");
        existingReport.setResultDate(resultDate);
        existingReport.setUpdatedAt(LocalDateTime.now());
        
        UtzReport savedReport = utzReportRepository.save(existingReport);
        
        UtzReportResponse response = new UtzReportResponse();
        BeanUtils.copyProperties(savedReport, response);
        return response;
    }
    
    public List<UtzReportResponse> getUtzReportsByPatient(String patientId) {
        // Validate patient exists
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient not found with id: " + patientId);
        }
        
        List<UtzReport> reports = utzReportRepository.findByPatientId(patientId);
        
        return reports.stream()
                .map(report -> {
                    UtzReportResponse response = new UtzReportResponse();
                    BeanUtils.copyProperties(report, response);
                    return response;
                })
                .collect(Collectors.toList());
    }
    
    public UtzReportResponse getUtzReportById(String patientId, String reportId) {
        // Validate patient exists
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient not found with id: " + patientId);
        }
        
        UtzReport report = utzReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("UTZ report not found with id: " + reportId));
        
        // Validate report belongs to patient
        if (!report.getPatientId().equals(patientId)) {
            throw new ValidationException("UTZ report does not belong to the specified patient");
        }
        
        UtzReportResponse response = new UtzReportResponse();
        BeanUtils.copyProperties(report, response);
        return response;
    }
    
    private LocalDate parseResultDate(String dateString) {
        if (dateString == null || dateString.trim().isEmpty()) {
            return LocalDate.now();
        }
        
        try {
            return LocalDate.parse(dateString.trim());
        } catch (DateTimeParseException e) {
            throw new ValidationException("Invalid date format. Expected yyyy-MM-dd");
        }
    }
}