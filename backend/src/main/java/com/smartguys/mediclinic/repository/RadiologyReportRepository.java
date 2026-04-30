package com.smartguys.mediclinic.repository;

import com.smartguys.mediclinic.model.RadiologyReport;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RadiologyReportRepository extends MongoRepository<RadiologyReport, String> {
    
    List<RadiologyReport> findByPatientId(String patientId);
    
    boolean existsByPatientId(String patientId);
}