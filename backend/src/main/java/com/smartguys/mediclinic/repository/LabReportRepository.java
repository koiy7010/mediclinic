package com.smartguys.mediclinic.repository;

import com.smartguys.mediclinic.model.LabReport;
import com.smartguys.mediclinic.model.enums.ReportType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabReportRepository extends MongoRepository<LabReport, String> {
    
    List<LabReport> findByPatientId(String patientId);
    
    List<LabReport> findByPatientIdAndReportType(String patientId, ReportType reportType);
    
    boolean existsByPatientId(String patientId);
}