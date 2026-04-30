package com.smartguys.mediclinic.service;

import com.smartguys.mediclinic.dto.response.SearchResultResponse;
import com.smartguys.mediclinic.model.Patient;
import com.smartguys.mediclinic.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SearchService {
    
    @Autowired
    private PatientRepository patientRepository;
    
    @Autowired
    private LabReportRepository labReportRepository;
    
    @Autowired
    private RadiologyReportRepository radiologyReportRepository;
    
    @Autowired
    private UtzReportRepository utzReportRepository;
    
    @Autowired
    private EcgReportRepository ecgReportRepository;
    
    @Autowired
    private MedicalExamRepository medicalExamRepository;
    
    public List<SearchResultResponse> globalSearch(String query) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }
        
        String searchQuery = query.trim();
        Pageable limit = PageRequest.of(0, 20);
        
        // Search patients with case-insensitive partial matching
        List<Patient> patients = patientRepository.findBySearchQuery(searchQuery, limit).getContent();
        
        // Convert to search results with report availability
        return patients.stream()
                .map(patient -> {
                    SearchResultResponse result = new SearchResultResponse();
                    result.setId(patient.getId());
                    result.setLastName(patient.getLastName());
                    result.setFirstName(patient.getFirstName());
                    result.setMiddleName(patient.getMiddleName());
                    result.setEmployer(patient.getEmployer());
                    result.setRegistrationDate(patient.getRegistrationDate());
                    
                    // Check report availability
                    Map<String, Boolean> reportAvailability = new HashMap<>();
                    reportAvailability.put("laboratory", labReportRepository.existsByPatientId(patient.getId()));
                    reportAvailability.put("xray", radiologyReportRepository.existsByPatientId(patient.getId()));
                    reportAvailability.put("utz", utzReportRepository.existsByPatientId(patient.getId()));
                    reportAvailability.put("ecg", ecgReportRepository.existsByPatientId(patient.getId()));
                    reportAvailability.put("medical_exam", medicalExamRepository.existsByPatientId(patient.getId()));
                    
                    result.setReportAvailability(reportAvailability);
                    
                    return result;
                })
                .collect(Collectors.toList());
    }
}