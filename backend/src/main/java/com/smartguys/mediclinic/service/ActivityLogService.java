package com.smartguys.mediclinic.service;

import com.smartguys.mediclinic.model.ActivityLog;
import com.smartguys.mediclinic.model.enums.ActionType;
import com.smartguys.mediclinic.model.enums.ModuleType;
import com.smartguys.mediclinic.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class ActivityLogService {
    
    @Autowired
    private ActivityLogRepository activityLogRepository;
    
    public void saveActivityLog(ActivityLog activityLog) {
        activityLogRepository.save(activityLog);
    }
    
    public Page<ActivityLog> getActivityLogs(Pageable pageable) {
        return activityLogRepository.findAll(pageable);
    }
    
    public Page<ActivityLog> getActivityLogsByDateRange(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();
        return activityLogRepository.findByDateRange(startDateTime, endDateTime, pageable);
    }
    
    public Page<ActivityLog> getActivityLogsByModule(ModuleType module, Pageable pageable) {
        return activityLogRepository.findByModule(module, pageable);
    }
    
    public Page<ActivityLog> getActivityLogsByAction(ActionType action, Pageable pageable) {
        return activityLogRepository.findByAction(action, pageable);
    }
    
    public Page<ActivityLog> searchActivityLogs(String searchQuery, Pageable pageable) {
        return activityLogRepository.findBySearchQuery(searchQuery, pageable);
    }
}