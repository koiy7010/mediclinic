package com.smartguys.mediclinic.aspect;

import com.smartguys.mediclinic.annotation.Auditable;
import com.smartguys.mediclinic.model.ActivityLog;
import com.smartguys.mediclinic.service.ActivityLogService;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import java.lang.reflect.Field;
import java.time.LocalDateTime;

@Aspect
@Component
public class AuditAspect {
    
    private final ActivityLogService activityLogService;
    
    public AuditAspect(ActivityLogService activityLogService) {
        this.activityLogService = activityLogService;
    }
    
    @Around("@annotation(auditable)")
    public Object auditMethod(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {
        Object result = joinPoint.proceed();
        
        try {
            String patientId = extractPatientId(joinPoint.getArgs(), result);
            String patientName = extractPatientName(joinPoint.getArgs(), result);
            String details = buildDetails(joinPoint.getSignature().getName(), joinPoint.getArgs());
            
            ActivityLog log = new ActivityLog();
            log.setTimestamp(LocalDateTime.now());
            log.setAction(auditable.action());
            log.setModule(auditable.module());
            log.setPatientId(patientId);
            log.setPatientName(patientName);
            log.setDetails(details);
            log.setUser("system"); // TODO: Extract from security context when authentication is implemented
            log.setCreatedAt(LocalDateTime.now());
            
            activityLogService.saveActivityLog(log);
        } catch (Exception e) {
            // Log the error but don't fail the main operation
            System.err.println("Failed to create audit log: " + e.getMessage());
        }
        
        return result;
    }
    
    private String extractPatientId(Object[] args, Object result) {
        // Try to extract from method arguments first
        for (Object arg : args) {
            if (arg instanceof String && arg.toString().matches("^[a-fA-F0-9]{24}$")) {
                return (String) arg;
            }
            String patientId = getFieldValue(arg, "patientId");
            if (patientId != null) {
                return patientId;
            }
        }
        
        // Try to extract from result
        if (result != null) {
            String patientId = getFieldValue(result, "patientId");
            if (patientId != null) {
                return patientId;
            }
        }
        
        return null;
    }
    
    private String extractPatientName(Object[] args, Object result) {
        // Try to extract from method arguments first
        for (Object arg : args) {
            String patientName = getFieldValue(arg, "patientName");
            if (patientName != null) {
                return patientName;
            }
            // Try to construct from firstName and lastName
            String firstName = getFieldValue(arg, "firstName");
            String lastName = getFieldValue(arg, "lastName");
            if (firstName != null && lastName != null) {
                return firstName + " " + lastName;
            }
        }
        
        // Try to extract from result
        if (result != null) {
            String patientName = getFieldValue(result, "patientName");
            if (patientName != null) {
                return patientName;
            }
            String firstName = getFieldValue(result, "firstName");
            String lastName = getFieldValue(result, "lastName");
            if (firstName != null && lastName != null) {
                return firstName + " " + lastName;
            }
        }
        
        return null;
    }
    
    private String getFieldValue(Object obj, String fieldName) {
        if (obj == null) return null;
        
        try {
            Field field = obj.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            Object value = field.get(obj);
            return value != null ? value.toString() : null;
        } catch (Exception e) {
            return null;
        }
    }
    
    private String buildDetails(String methodName, Object[] args) {
        StringBuilder details = new StringBuilder();
        details.append("Method: ").append(methodName);
        
        if (args.length > 0) {
            details.append(", Args: ");
            for (int i = 0; i < args.length; i++) {
                if (i > 0) details.append(", ");
                details.append(args[i] != null ? args[i].getClass().getSimpleName() : "null");
            }
        }
        
        return details.toString();
    }
}