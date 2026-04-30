package com.smartguys.mediclinic.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class ReferenceRangeServiceTest {
    
    private ReferenceRangeService referenceRangeService;
    
    @BeforeEach
    void setUp() {
        referenceRangeService = new ReferenceRangeService();
    }
    
    @Test
    void testEvaluateFlags_NormalValues() {
        Map<String, Object> labData = new HashMap<>();
        labData.put("hemoglobin", 14.0); // Normal range: 12.0-16.0
        labData.put("fbs", 85.0); // Normal range: 70.0-100.0
        
        Map<String, String> flags = referenceRangeService.evaluateFlags(labData);
        
        assertEquals("normal", flags.get("hemoglobin"));
        assertEquals("normal", flags.get("fbs"));
    }
    
    @Test
    void testEvaluateFlags_AbnormalValues() {
        Map<String, Object> labData = new HashMap<>();
        labData.put("hemoglobin", 11.0); // Below normal range
        labData.put("fbs", 110.0); // Above normal range
        
        Map<String, String> flags = referenceRangeService.evaluateFlags(labData);
        
        assertEquals("abnormal", flags.get("hemoglobin"));
        assertEquals("abnormal", flags.get("fbs"));
    }
    
    @Test
    void testEvaluateFlags_CriticalValues() {
        Map<String, Object> labData = new HashMap<>();
        labData.put("hemoglobin", 5.0); // Below critical range
        labData.put("fbs", 450.0); // Above critical range
        
        Map<String, String> flags = referenceRangeService.evaluateFlags(labData);
        
        assertEquals("critical", flags.get("hemoglobin"));
        assertEquals("critical", flags.get("fbs"));
    }
    
    @Test
    void testEvaluateFlags_EmptyData() {
        Map<String, String> flags = referenceRangeService.evaluateFlags(null);
        assertTrue(flags.isEmpty());
        
        flags = referenceRangeService.evaluateFlags(new HashMap<>());
        assertTrue(flags.isEmpty());
    }
}