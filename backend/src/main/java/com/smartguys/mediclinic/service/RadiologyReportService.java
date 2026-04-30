package com.smartguys.mediclinic.service;

import com.smartguys.mediclinic.annotation.Auditable;
import com.smartguys.mediclinic.dto.request.RadiologyReportRequest;
import com.smartguys.mediclinic.dto.response.RadiologyReportResponse;
import com.smartguys.mediclinic.exception.ResourceNotFoundException;
import com.smartguys.mediclinic.exception.ValidationException;
import com.smartguys.mediclinic.model.RadiologyReport;
import com.smartguys.mediclinic.model.enums.ActionType;
import com.smartguys.mediclinic.model.enums.ModuleType;
import com.smartguys.mediclinic.repository.PatientRepository;
import com.smartguys.mediclinic.repository.RadiologyReportRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RadiologyReportService {
    
    private final RadiologyReportRepository radiologyReportRepository;
    private final PatientRepository patientRepository;
    
    public RadiologyReportService(RadiologyReportRepository radiologyReportRepository, PatientRepository patientRepository) {
        this.radiologyReportRepository = radiologyReportRepository;
        this.patientRepository = patientRepository;
    }
    
    @Auditable(action = ActionType.CREATED, module = ModuleType.X_RAY)
    public RadiologyReportResponse createRadiologyReport(String patientId, RadiologyReportRequest request) {
        // Validate patient exists
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient not found with id: " + patientId);
        }
        
        // Validate result date
        LocalDate resultDate = parseResultDate(request.getResultDate());
        
        RadiologyReport report = new RadiologyReport();
        BeanUtils.copyProperties(request, report, "resultDate");
        report.setPatientId(patientId);
        report.setResultDate(resultDate);
        
        LocalDateTime now = LocalDateTime.now();
        report.setCreatedAt(now);
        report.setUpdatedAt(now);
        
        RadiologyReport savedReport = radiologyReportRepository.save(report);
        
        RadiologyReportResponse response = new RadiologyReportResponse();
        BeanUtils.copyProperties(savedReport, response);
        return response;
    }
    
    @Auditable(action = ActionType.UPDATED, module = ModuleType.X_RAY)
    public RadiologyReportResponse updateRadiologyReport(String patientId, String reportId, RadiologyReportRequest request) {
        // Validate patient exists
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient not found with id: " + patientId);
        }
        
        RadiologyReport existingReport = radiologyReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Radiology report not found with id: " + reportId));
        
        // Validate report belongs to patient
        if (!existingReport.getPatientId().equals(patientId)) {
            throw new ValidationException("Radiology report does not belong to the specified patient");
        }
        
        // Validate result date
        LocalDate resultDate = parseResultDate(request.getResultDate());
        
        BeanUtils.copyProperties(request, existingReport, "id", "patientId", "createdAt", "resultDate");
        existingReport.setResultDate(resultDate);
        existingReport.setUpdatedAt(LocalDateTime.now());
        
        RadiologyReport savedReport = radiologyReportRepository.save(existingReport);
        
        RadiologyReportResponse response = new RadiologyReportResponse();
        BeanUtils.copyProperties(savedReport, response);
        return response;
    }
    
    public List<RadiologyReportResponse> getRadiologyReportsByPatient(String patientId) {
        // Validate patient exists
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient not found with id: " + patientId);
        }
        
        List<RadiologyReport> reports = radiologyReportRepository.findByPatientId(patientId);
        
        return reports.stream()
                .map(report -> {
                    RadiologyReportResponse response = new RadiologyReportResponse();
                    BeanUtils.copyProperties(report, response);
                    return response;
                })
                .collect(Collectors.toList());
    }
    
    public RadiologyReportResponse getRadiologyReportById(String patientId, String reportId) {
        // Validate patient exists
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient not found with id: " + patientId);
        }
        
        RadiologyReport report = radiologyReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Radiology report not found with id: " + reportId));
        
        // Validate report belongs to patient
        if (!report.getPatientId().equals(patientId)) {
            throw new ValidationException("Radiology report does not belong to the specified patient");
        }
        
        RadiologyReportResponse response = new RadiologyReportResponse();
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