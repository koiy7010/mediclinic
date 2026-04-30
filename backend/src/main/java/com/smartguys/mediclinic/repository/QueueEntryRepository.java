package com.smartguys.mediclinic.repository;

import com.smartguys.mediclinic.model.QueueEntry;
import com.smartguys.mediclinic.model.enums.QueueStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface QueueEntryRepository extends MongoRepository<QueueEntry, String> {
    
    @Query("{ 'createdAt': { $gte: ?0, $lt: ?1 } }")
    Page<QueueEntry> findByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    @Query("{ 'createdAt': { $gte: ?0, $lt: ?1 }, 'status': ?2 }")
    Page<QueueEntry> findByDateRangeAndStatus(LocalDateTime startDate, LocalDateTime endDate, QueueStatus status, Pageable pageable);
    
    @Query("{ 'createdAt': { $gte: ?0, $lt: ?1 }, 'status': 'done' }")
    void deleteByDateRangeAndStatusDone(LocalDateTime startDate, LocalDateTime endDate);
}