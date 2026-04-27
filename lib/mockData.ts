export const mockPatients = [
  {
    id: 'p1',
    registration_date: '2024-01-15',
    last_name: 'Santos',
    first_name: 'Maria',
    middle_name: 'Cruz',
    address: '123 Rizal St., Quezon City, Metro Manila',
    contact_number: '+63 917 123 4567',
    employer: 'BDO Unibank',
    birthdate: '1990-03-22',
    marital_status: 'Married',
    gender: 'Female',
    nationality: 'Filipino',
  },
  {
    id: 'p2',
    registration_date: '2024-02-10',
    last_name: 'Reyes',
    first_name: 'Juan',
    middle_name: 'dela Cruz',
    address: '456 Mabini Ave., Makati City',
    contact_number: '+63 918 234 5678',
    employer: 'SM Investments',
    birthdate: '1985-07-14',
    marital_status: 'Single',
    gender: 'Male',
    nationality: 'Filipino',
  },
  {
    id: 'p3',
    registration_date: '2024-03-05',
    last_name: 'Garcia',
    first_name: 'Ana',
    middle_name: 'Lim',
    address: '789 Bonifacio St., Pasig City',
    contact_number: '+63 919 345 6789',
    employer: 'Jollibee Foods Corp.',
    birthdate: '1995-11-30',
    marital_status: 'Single',
    gender: 'Female',
    nationality: 'Filipino',
  },
  {
    id: 'p4',
    registration_date: '2024-04-20',
    last_name: 'Mendoza',
    first_name: 'Carlos',
    middle_name: 'Bautista',
    address: '321 Luna Rd., Taguig City',
    contact_number: '+63 920 456 7890',
    employer: 'PLDT Inc.',
    birthdate: '1978-05-08',
    marital_status: 'Married',
    gender: 'Male',
    nationality: 'Filipino',
  },
  {
    id: 'p5',
    registration_date: '2024-05-12',
    last_name: 'Torres',
    first_name: 'Liza',
    middle_name: 'Ramos',
    address: '654 Aguinaldo Blvd., Mandaluyong City',
    contact_number: '+63 921 567 8901',
    employer: 'Ayala Corporation',
    birthdate: '1992-09-17',
    marital_status: 'Married',
    gender: 'Female',
    nationality: 'Filipino',
  },
]

export const mockLabReports: Record<string, any[]> = {
  p1: [
    { id: 'lr1', patient_id: 'p1', report_type: 'Urinalysis', result_date: '2024-06-01', remarks: 'Normal', is_normal: true },
    { id: 'lr2', patient_id: 'p1', report_type: 'Hematology', result_date: '2024-06-01', remarks: 'Normal', is_normal: true },
    { id: 'lr3', patient_id: 'p1', report_type: 'Chem10', result_date: '2024-06-01', remarks: 'Slightly elevated cholesterol', is_normal: false },
  ],
  p2: [
    { id: 'lr4', patient_id: 'p2', report_type: 'Urinalysis', result_date: '2024-05-20', remarks: 'Normal', is_normal: true },
    { id: 'lr5', patient_id: 'p2', report_type: 'HbA1c', result_date: '2024-05-20', remarks: 'Pre-diabetic range', is_normal: false },
  ],
  p3: [
    { id: 'lr6', patient_id: 'p3', report_type: 'Serology', result_date: '2024-04-15', remarks: 'Non-reactive', is_normal: true },
  ],
  p4: [
    { id: 'lr7', patient_id: 'p4', report_type: 'Hematology', result_date: '2024-03-10', remarks: 'Normal', is_normal: true },
    { id: 'lr8', patient_id: 'p4', report_type: 'Chem10', result_date: '2024-03-10', remarks: 'Normal', is_normal: true },
    { id: 'lr9', patient_id: 'p4', report_type: 'Fecalysis', result_date: '2024-03-10', remarks: 'Normal', is_normal: true },
  ],
  p5: [],
}

export const mockLabData: Record<string, Record<string, any>> = {
  p1: {
    Urinalysis: {
      result_date: '2024-06-01',
      color: 'Yellow', transparency: 'Clear', specific_gravity: '1.010',
      ph: '6.0', glucose: 'Negative', protein: 'Negative',
      wbc: '0–2', rbc: '0–2', epithelial: 'Few', mucus: 'None',
      bacteria: 'None', amorphous_urates: 'None', amorphous_phosphates: 'None',
      others: '', remark: '', is_normal: true,
    },
    Hematology: {
      result_date: '2024-06-01',
      rbc: '4.8', hemoglobin: '138', hematocrit: '0.41', platelet: '280', wbc: '6.5',
      neutrophil: '62', lymphocyte: '28', monocyte: '6', eosinophil: '3', basophil: '1',
      others_diff: '', remark: '', is_normal: true,
    },
    Chem10: {
      result_date: '2024-06-01',
      fbs: '5.2', bun: '4.8', uric_acid: '290', creatinine: '75',
      cholesterol: '5.5', triglyceride: '1.5', hdl: '1.2', ldl: '3.8', vldl: '0.7',
      sgpt: '28', sgot: '24', is_normal: false,
    },
  },
  p2: {
    Urinalysis: {
      result_date: '2024-05-20',
      color: 'Yellow', transparency: 'Clear', specific_gravity: '1.015',
      ph: '6.5', glucose: 'Negative', protein: 'Negative',
      wbc: '0–2', rbc: '0–1', epithelial: 'Few', mucus: 'None',
      bacteria: 'None', amorphous_urates: 'None', amorphous_phosphates: 'None',
      others: '', remark: '', is_normal: true,
    },
    HbA1c: {
      result_date: '2024-05-20',
      hba1c: '6.1', is_normal: false,
    },
  },
  p3: {
    Serology: {
      result_date: '2024-04-15',
      rows: [
        { test: 'HBsAg', specimen: 'Serum', result: 'Non-Reactive' },
        { test: 'VDRL', specimen: 'Serum', result: 'Non-Reactive' },
      ],
      is_normal: true,
    },
  },
  p4: {
    Hematology: {
      result_date: '2024-03-10',
      rbc: '5.1', hemoglobin: '155', hematocrit: '0.46', platelet: '220', wbc: '7.2',
      neutrophil: '58', lymphocyte: '32', monocyte: '5', eosinophil: '4', basophil: '1',
      others_diff: '', remark: '', is_normal: true,
    },
    Chem10: {
      result_date: '2024-03-10',
      fbs: '5.0', bun: '5.2', uric_acid: '320', creatinine: '90',
      cholesterol: '4.8', triglyceride: '1.3', hdl: '1.1', ldl: '3.1', vldl: '0.6',
      sgpt: '22', sgot: '20', is_normal: true,
    },
    Fecalysis: {
      result_date: '2024-03-10',
      color: 'Brown', consistency: 'Formed', wbc: '0–2', rbc: '0–2',
      fat_globules: 'None', bacteria: 'None', ova: 'none', remark: '', is_normal: true,
    },
  },
}

export const mockRadiologyReports: Record<string, any[]> = {
  p1: [
    {
      id: 'rr1', patient_id: 'p1',
      report_title: 'Chest PA (Postero-Anterior)',
      result_date: '2024-06-01',
      examination_type: 'X-Ray',
      xray_no: 'XR-240601',
      findings: 'The lungs are clear. No infiltrates, consolidation, or pleural effusion noted. The heart is not enlarged. The mediastinum is within normal limits. The bony thorax is intact.',
      impression: 'Normal chest PA view.',
      is_normal: true,
    },
  ],
  p2: [
    {
      id: 'rr2', patient_id: 'p2',
      report_title: 'Chest PA (Postero-Anterior)',
      result_date: '2024-05-20',
      examination_type: 'X-Ray',
      xray_no: 'XR-240520',
      findings: 'Minimal infiltrates noted in the right upper lobe. Left lung is clear. Heart size is normal. Bony thorax intact.',
      impression: 'Findings suggest minimal PTB. Please correlate clinically.',
      is_normal: false,
    },
  ],
  p4: [
    {
      id: 'rr3', patient_id: 'p4',
      report_title: 'Chest PA (Postero-Anterior)',
      result_date: '2024-03-10',
      examination_type: 'X-Ray',
      xray_no: 'XR-240310',
      findings: 'The heart appears mildly enlarged. The pulmonary vascularity is within normal limits. No pleural effusion. Lungs are clear.',
      impression: 'Mild cardiomegaly.',
      is_normal: false,
    },
  ],
}

export const mockMedicalExams: Record<string, any> = {
  p1: {
    result_date: '2024-06-01',
    height: 158, weight: 55, bmi: 22.0, bmi_classification: 'Normal',
    sa_no: 'SA-2024-001',
    past_medical_history: { conditions: {}, smoker: false, alcohol: false },
    physical_examination: {
      bp_systolic: 110, bp_diastolic: 70, pulse_rate: 78, respiration: 18, temperature: 36.6,
      ishihara: 'Normal',
    },
    evaluation: 'A',
    remarks: 'Fit for work',
    recommendations: 'Maintain healthy lifestyle.',
    for_clearance: false,
  },
  p2: {
    result_date: '2024-05-20',
    height: 172, weight: 80, bmi: 27.0, bmi_classification: 'Overweight',
    sa_no: 'SA-2024-002',
    past_medical_history: { conditions: { Hypertension: false }, smoker: true, packs_per_day: '0.5', alcohol: true, alcohol_years: '5' },
    physical_examination: {
      bp_systolic: 135, bp_diastolic: 88, pulse_rate: 82, respiration: 20, temperature: 36.8,
      ishihara: 'Normal',
    },
    evaluation: 'B',
    remarks: 'Hypertension noted, on medication',
    recommendations: 'Follow up with cardiologist. Reduce sodium intake.',
    for_clearance: true,
  },
}
