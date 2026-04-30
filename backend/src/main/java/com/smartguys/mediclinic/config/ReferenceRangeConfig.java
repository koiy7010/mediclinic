package com.smartguys.mediclinic.config;

import lombok.Data;

import java.util.HashMap;
import java.util.Map;

@Data
public class ReferenceRangeConfig {
    
    public static class Range {
        public final double normalMin;
        public final double normalMax;
        public final double criticalMin;
        public final double criticalMax;
        
        public Range(double normalMin, double normalMax, double criticalMin, double criticalMax) {
            this.normalMin = normalMin;
            this.normalMax = normalMax;
            this.criticalMin = criticalMin;
            this.criticalMax = criticalMax;
        }
    }
    
    public static final Map<String, Range> REFERENCE_RANGES = new HashMap<>();
    
    static {
        // Hematology ranges
        REFERENCE_RANGES.put("rbc", new Range(4.5, 5.5, 2.0, 8.0));
        REFERENCE_RANGES.put("hemoglobin", new Range(12.0, 16.0, 6.0, 20.0));
        REFERENCE_RANGES.put("hematocrit", new Range(36.0, 46.0, 20.0, 60.0));
        REFERENCE_RANGES.put("platelet", new Range(150.0, 450.0, 50.0, 1000.0));
        REFERENCE_RANGES.put("wbc", new Range(4.0, 11.0, 1.0, 30.0));
        REFERENCE_RANGES.put("neutrophil", new Range(50.0, 70.0, 20.0, 90.0));
        REFERENCE_RANGES.put("lymphocyte", new Range(20.0, 40.0, 5.0, 60.0));
        REFERENCE_RANGES.put("monocyte", new Range(2.0, 8.0, 0.0, 15.0));
        REFERENCE_RANGES.put("eosinophil", new Range(1.0, 4.0, 0.0, 10.0));
        REFERENCE_RANGES.put("basophil", new Range(0.0, 2.0, 0.0, 5.0));
        
        // Chemistry ranges
        REFERENCE_RANGES.put("fbs", new Range(70.0, 100.0, 40.0, 400.0));
        REFERENCE_RANGES.put("bun", new Range(7.0, 20.0, 2.0, 100.0));
        REFERENCE_RANGES.put("uric_acid", new Range(3.5, 7.2, 1.0, 15.0));
        REFERENCE_RANGES.put("creatinine", new Range(0.6, 1.2, 0.2, 10.0));
        REFERENCE_RANGES.put("cholesterol", new Range(150.0, 200.0, 50.0, 500.0));
        REFERENCE_RANGES.put("triglyceride", new Range(50.0, 150.0, 20.0, 1000.0));
        REFERENCE_RANGES.put("hdl", new Range(40.0, 60.0, 10.0, 100.0));
        REFERENCE_RANGES.put("ldl", new Range(70.0, 130.0, 20.0, 300.0));
        REFERENCE_RANGES.put("sgpt", new Range(7.0, 56.0, 0.0, 500.0));
        REFERENCE_RANGES.put("sgot", new Range(10.0, 40.0, 0.0, 500.0));
        
        // HbA1c ranges
        REFERENCE_RANGES.put("hba1c", new Range(4.0, 5.6, 2.0, 15.0));
        
        // Urinalysis ranges
        REFERENCE_RANGES.put("specific_gravity", new Range(1.003, 1.030, 1.000, 1.050));
        REFERENCE_RANGES.put("ph", new Range(5.0, 8.0, 4.0, 9.0));
    }
}