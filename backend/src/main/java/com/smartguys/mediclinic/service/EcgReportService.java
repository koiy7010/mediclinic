package com.smartguys.mediclinic.service;

import com.smartguys.mediclinic.annotation.Auditable;
import com.smartguys.mediclinic.dto.request.EcgReportRequest;
import com.smartguys.mediclinic.dto.response.EcgReportResponse;
import com.smartguys.mediclinic.exception.ResourceNotFoundException;
import com.smartguys.mediclinic.exception.ValidationException;
import com.smartguys.mediclinic.model.EcgReport;
import com.smartguys.mediclinic.model.enums.ActionType;
import com.smartguys.mediclinic.model.enums.ModuleType;
import com.smartguys.mediclinic.repository.EcgReportRepository;
import com.smartguys.mediclinic.repository.PatientRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EcgReportService {
    
    @Autowired
    private EcgReportRepository ecgReportRepository;
    
    @Autowired
    private PatientRepository patientRepository;
    
    @Auditable(action = ActionType.CREATED, module = ModuleType.ECG)
    public EcgReportResponse createEcgReport(String patientId, EcgReportRequest request) {
        // Validate patient exists
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient not found with id: " + patientId);
        }
        
        // Validate result date
        LocalDate resultDate = parseResultDate(request.getResultDate());
        
        EcgReport report = new EcgReport();
        BeanUtils.copyProperties(request, report, "resultDate");
        report.setPatientId(patientId);
        report.setResultDate(resultDate);
        
        LocalDateTime now = LocalDateTime.now();
        report.setCreatedAt(now);
        report.setUpdatedAt(now);
        
        EcgReport savedReport = ecgReportRepository.save(report);
        
        EcgReportResponse response = new EcgReportResponse();
        BeanUtils.copyProperties(savedReport, response);
        return response;
    }
    
    @Auditable(action = ActionType.UPDATED, module = ModuleType.ECG)
    public EcgReportResponse updateEcgReport(String patientId, String reportId, EcgReportRequest request) {
        // Validate patient exists
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient not found with id: " + patientId);
        }
        
        EcgReport existingReport = ecgReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("ECG report not found with id: " + reportId));
        
        // Validate report belongs to patient
        if (!existingReport.getPatientId().equals(patientId)) {
            throw new ValidationException("ECG report does not belong to the specified patient");
        }
        
        // Validate result date
        LocalDate resultDate = parseResultDate(request.getResultDate());
        
        BeanUtils.copyProperties(request, existingReport, "id", "patientId", "createdAt", "resultDate");
        existingReport.setResultDate(resultDate);
        existingReport.setUpdatedAt(LocalDateTime.now());
        
        EcgReport savedReport = ecgReportRepository.save(existingReport);
        
        EcgReportResponse response = new EcgReportResponse();
        BeanUtils.copyProperties(savedReport, response);
        return response;
    }
    
    public List<EcgReportResponse> getEcgReportsByPatient(String patientId) {
        // Validate patient exists
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient not found with id: " + patientId);
        }
        
        List<EcgReport> reports = ecgReportRepository.findByPatientId(patientId);
        
        return reports.stream()
                .map(report -> {
                    EcgReportResponse response = new EcgReportResponse();
                    BeanUtils.copyProperties(report, response);
                    return response;
                })
                .collect(Collectors.toList());
    }
    
    public EcgReportResponse getEcgReportById(String patientId, String reportId) {
        // Validate patient exists
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient not found with id: " + patientId);
        }
        
        EcgReport report = ecgReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("ECG report not found with id: " + reportId));
        
        // Validate report belongs to patient
        if (!report.getPatientId().equals(patientId)) {
            throw new ValidationException("ECG report does not belong to the specified patient");
        }
        
        EcgReportResponse response = new EcgReportResponse();
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