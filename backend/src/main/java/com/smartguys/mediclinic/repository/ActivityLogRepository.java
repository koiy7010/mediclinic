package com.smartguys.mediclinic.repository;

import com.smartguys.mediclinic.model.ActivityLog;
import com.smartguys.mediclinic.model.enums.ActionType;
import com.smartguys.mediclinic.model.enums.ModuleType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface ActivityLogRepository extends MongoRepository<ActivityLog, String> {
    
    @Query("{ 'timestamp': { $gte: ?0, $lt: ?1 } }")
    Page<ActivityLog> findByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    Page<ActivityLog> findByModule(ModuleType module, Pageable pageable);
    
    Page<ActivityLog> findByAction(ActionType action, Pageable pageable);
    
    @Query("{ $or: [ " +
           "{ 'patientName': { $regex: ?0, $options: 'i' } }, " +
           "{ 'details': { $regex: ?0, $options: 'i' } }, " +
           "{ 'user': { $regex: ?0, $options: 'i' } } " +
           "] }")
    Page<ActivityLog> findBySearchQuery(String searchQuery, Pageable pageable);
}