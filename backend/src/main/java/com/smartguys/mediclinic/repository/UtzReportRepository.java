package com.smartguys.mediclinic.repository;

import com.smartguys.mediclinic.model.UtzReport;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UtzReportRepository extends MongoRepository<UtzReport, String> {
    
    List<UtzReport> findByPatientId(String patientId);
    
    boolean existsByPatientId(String patientId);
}