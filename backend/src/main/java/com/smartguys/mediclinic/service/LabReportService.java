package com.smartguys.mediclinic.service;

import com.smartguys.mediclinic.annotation.Auditable;
import com.smartguys.mediclinic.dto.request.LabReportRequest;
import com.smartguys.mediclinic.dto.response.LabReportResponse;
import com.smartguys.mediclinic.exception.ResourceNotFoundException;
import com.smartguys.mediclinic.exception.ValidationException;
import com.smartguys.mediclinic.model.LabReport;
import com.smartguys.mediclinic.model.enums.ActionType;
import com.smartguys.mediclinic.model.enums.ModuleType;
import com.smartguys.mediclinic.model.enums.ReportType;
import com.smartguys.mediclinic.repository.LabReportRepository;
import com.smartguys.mediclinic.repository.PatientRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class LabReportService {
    
    @Autowired
    private LabReportRepository labReportRepository;
    
    @Autowired
    private PatientRepository patientRepository;
    
    @Autowired
    private ReferenceRangeService referenceRangeService;
    
    @Auditable(action = ActionType.CREATED, module = ModuleType.LABORATORY)
    public LabReportResponse createLabReport(String patientId, LabReportRequest request) {
        // Validate patient exists
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient not found with id: " + patientId);
        }
        
        // Validate result date
        LocalDate resultDate = parseResultDate(request.getResultDate());
        
        LabReport labReport = new LabReport();
        BeanUtils.copyProperties(request, labReport, "resultDate");
        labReport.setPatientId(patientId);
        labReport.setResultDate(resultDate);
        
        // Compute flags for numeric fields
        Map<String, String> flags = referenceRangeService.evaluateFlags(request.getData());
        labReport.setFlags(flags);
        
        LocalDateTime now = LocalDateTime.now();
        labReport.setCreatedAt(now);
        labReport.setUpdatedAt(now);
        
        LabReport savedReport = labReportRepository.save(labReport);
        
        LabReportResponse response = new LabReportResponse();
        BeanUtils.copyProperties(savedReport, response);
        return response;
    }
    
    @Auditable(action = ActionType.UPDATED, module = ModuleType.LABORATORY)
    public LabReportResponse updateLabReport(String patientId, String reportId, LabReportRequest request) {
        // Validate patient exists
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient not found with id: " + patientId);
        }
        
        LabReport existingReport = labReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab report not found with id: " + reportId));
        
        // Validate report belongs to patient
        if (!existingReport.getPatientId().equals(patientId)) {
            throw new ValidationException("Lab report does not belong to the specified patient");
        }
        
        // Validate result date
        LocalDate resultDate = parseResultDate(request.getResultDate());
        
        BeanUtils.copyProperties(request, existingReport, "id", "patientId", "createdAt", "resultDate");
        existingReport.setResultDate(resultDate);
        
        // Compute flags for numeric fields
        Map<String, String> flags = referenceRangeService.evaluateFlags(request.getData());
        existingReport.setFlags(flags);
        
        existingReport.setUpdatedAt(LocalDateTime.now());
        
        LabReport savedReport = labReportRepository.save(existingReport);
        
        LabReportResponse response = new LabReportResponse();
        BeanUtils.copyProperties(savedReport, response);
        return response;
    }
    
    public List<LabReportResponse> getLabReportsByPatient(String patientId, ReportType reportType) {
        // Validate patient exists
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient not found with id: " + patientId);
        }
        
        List<LabReport> reports;
        if (reportType != null) {
            reports = labReportRepository.findByPatientIdAndReportType(patientId, reportType);
        } else {
            reports = labReportRepository.findByPatientId(patientId);
        }
        
        return reports.stream()
                .map(report -> {
                    LabReportResponse response = new LabReportResponse();
                    BeanUtils.copyProperties(report, response);
                    return response;
                })
                .collect(Collectors.toList());
    }
    
    public LabReportResponse getLabReportById(String patientId, String reportId) {
        // Validate patient exists
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient not found with id: " + patientId);
        }
        
        LabReport report = labReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab report not found with id: " + reportId));
        
        // Validate report belongs to patient
        if (!report.getPatientId().equals(patientId)) {
            throw new ValidationException("Lab report does not belong to the specified patient");
        }
        
        LabReportResponse response = new LabReportResponse();
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