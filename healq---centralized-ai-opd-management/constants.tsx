
import { Hospital, Token, Slot, Ambulance } from './types';

const generateSlots = (bookedBase: number = 5): Slot[] => [
  { id: 's1', timeRange: '08:00 AM - 09:00 AM', bookedCount: Math.floor(Math.random() * 20), maxCapacity: 30 },
  { id: 's2', timeRange: '09:00 AM - 10:00 AM', bookedCount: Math.floor(Math.random() * 25), maxCapacity: 30 },
  { id: 's3', timeRange: '10:00 AM - 11:00 AM', bookedCount: Math.floor(Math.random() * 28), maxCapacity: 30 },
  { id: 's4', timeRange: '11:00 AM - 12:00 PM', bookedCount: Math.floor(Math.random() * 20), maxCapacity: 30 },
  { id: 's5', timeRange: '12:00 PM - 01:00 PM', bookedCount: Math.floor(Math.random() * 15), maxCapacity: 30 },
];

const createDoc = (id: string, name: string, specialty: string, room: string, queue: number, token: number, delay: number = 0, msg?: string) => ({
  id,
  name,
  specialty,
  availability: 'Available' as const,
  currentRoom: room,
  averageConsultationTime: 12,
  currentQueue: queue,
  currentToken: token,
  slots: generateSlots(),
  delayMinutes: delay,
  statusMessage: msg
});

const generateHospitals = (
  state: string, 
  count: number, 
  prefix: string, 
  type: 'Government' | 'Private' = 'Government'
): Hospital[] => {
  const hospitals: Hospital[] = [];
  
  const govNames = [
    'District Civil Hospital', 'Government Medical College', 'Apex State Hospital', 
    'ESI Hospital', 'General Hospital', 'Memorial State Hospital', 'Regional Health Center',
    'State Referral Hospital', 'Central Hospital'
  ];
  
  const privateNames = [
    'Apollo Hospital', 'Max Super Specialty', 'Fortis Hospital', 'Medanta', 
    'Manipal Hospital', 'Global Health City', 'Narayana Health', 'Cloudnine',
    'Aster DM Healthcare', 'KIMS Hospital', 'Care Hospitals', 'AMRI Hospital',
    'Yashoda Hospital', 'Continental Hospital', 'Ruby Hall Clinic', 'Nanavati Hospital',
    'GNRC Hospital', 'Down Town Hospital', 'Health City', 'Excelcare', 'Northeast Medical Center'
  ];

  const hospitalNames = type === 'Government' ? govNames : privateNames;
  const locations = [
    'North Zone', 'Central City', 'Old Town', 'East Block', 'South Extension', 
    'West Gate', 'Business District', 'Suburb A', 'Highway Junction', 'Hill View',
    'Riverside', 'Station Road', 'MG Road', 'Uptown'
  ];
  
  const allDepartments = [
    'Cardiology', 'Dermatology', 'Pediatrics', 'Orthopedics', 'General Medicine', 
    'Neurology', 'Oncology', 'ENT', 'Ophthalmology', 'Gynecology', 'Obstetrics', 
    'Psychiatry', 'Urology', 'Nephrology', 'Pulmonology', 'Gastroenterology', 
    'Endocrinology', 'Plastic Surgery', 'PMR (Physiotherapy)', 'Dental', 
    'Ayurveda', 'Homeopathy', 'General Surgery', 'Chest & TB', 'Rheumatology',
    'Radiology', 'Hematology', 'Immunology', 'Vascular Surgery', 'Neurosurgery',
    'Palliative Care', 'Dietetics', 'Sports Medicine', 'Emergency Medicine',
    'Infectious Diseases', 'Uro-Oncology', 'Geriatrics', 'Pain Management'
  ];
  
  const docSurnames = [
    'Kumar', 'Singh', 'Sharma', 'Patil', 'Iyer', 'Chatterjee', 'Reddy', 'Gupta', 
    'Khan', 'Das', 'Nair', 'Deshmukh', 'Tsering', 'Sangma', 'Laskar', 'Banerjee', 
    'Mehta', 'Kulkarni', 'Borah', 'Saikia', 'Gogoi', 'Dutta', 'Phukan', 'Baruah',
    'Deka', 'Sarma', 'Nath', 'Talukdar', 'Kalita', 'Goswami', 'Shah', 'Patel', 'Zala'
  ];
  
  for (let i = 1; i <= count; i++) {
    const totalWaiting = Math.floor(Math.random() * (type === 'Government' ? 800 : 200)) + 50;
    const shuffledDepts = [...allDepartments].sort(() => 0.5 - Math.random());
    // Increased the number of departments per hospital
    const selectedDeptsCount = type === 'Government' ? (Math.floor(Math.random() * 10) + 12) : (Math.floor(Math.random() * 8) + 8);
    const selectedDepts = shuffledDepts.slice(0, selectedDeptsCount);

    const h: Hospital = {
      id: `h-${type.toLowerCase()}-${prefix}-${i}`,
      name: `${hospitalNames[Math.floor(Math.random() * hospitalNames.length)]} ${i > 1 ? i : ''} (${state})`.replace('  ', ' '),
      type,
      state,
      location: `${locations[Math.floor(Math.random() * locations.length)]}, ${state}`,
      distance: parseFloat((Math.random() * 40 + 2).toFixed(1)),
      totalWaitingCount: totalWaiting,
      facilities: type === 'Government' 
        ? ["OPD", "Emergency", "Pharmacy", "Labs", "X-Ray", "Vaccination"]
        : ["OPD", "Emergency", "Luxury Suites", "Diagnostics", "24/7 Pharmacy", "Cafeteria", "Health Checkups"],
      opdTimings: type === 'Government' ? "08:30 AM - 04:30 PM" : "09:00 AM - 08:00 PM",
      bedAvailability: { 
        total: Math.floor(Math.random() * (type === 'Government' ? 1500 : 400)) + 100, 
        available: Math.floor(Math.random() * 40) 
      },
      coordinates: {
        lat: 20.0 + (Math.random() - 0.5) * 15,
        lng: 78.0 + (Math.random() - 0.5) * 15
      },
      departments: selectedDepts.map((deptName, deptIdx) => ({
        id: `d-${type.toLowerCase()}-${prefix}-${i}-${deptIdx}`,
        name: deptName,
        doctors: [
          createDoc(
            `doc-${type.toLowerCase()}-${prefix}-${i}-${deptIdx}-1`, 
            `Dr. ${docSurnames[Math.floor(Math.random() * docSurnames.length)]}`, 
            `${deptName} Specialist`, 
            `Room ${deptIdx + 101}`, 
            Math.floor(Math.random() * (type === 'Government' ? 40 : 15)) + 2, 
            Math.floor(Math.random() * 100) + 10,
            Math.random() > 0.9 ? Math.floor(Math.random() * 15) : 0
          )
        ]
      }))
    };
    hospitals.push(h);
  }
  return hospitals;
};

const BASE_HOSPITALS: Hospital[] = [
  {
    id: 'h-del-aiims',
    name: 'AIIMS Delhi',
    type: 'Government',
    state: 'Delhi',
    location: 'Ansari Nagar, New Delhi',
    distance: 1.2,
    totalWaitingCount: 1500,
    facilities: ["OPD", "Trauma Care", "Research", "Emergency", "Organ Transplant", "ICU", "Labs"],
    opdTimings: "08:00 AM - 04:00 PM",
    bedAvailability: { total: 2400, available: 12 },
    coordinates: { lat: 28.5672, lng: 77.2100 },
    departments: [
      { id: 'd-del-1-1', name: 'Cardiology', doctors: [createDoc('doc-del-1', 'Dr. V.K. Bahl', 'Senior Cardiologist', 'Block A, R-1', 120, 450, 15)] },
      { id: 'd-del-1-2', name: 'Neurology', doctors: [createDoc('doc-del-2', 'Dr. M. Tripathi', 'Neurologist', 'Block B, R-5', 80, 210)] },
      { id: 'd-del-1-3', name: 'General Medicine', doctors: [createDoc('doc-del-3', 'Dr. Ankit Gupta', 'Senior Physician', 'Block C, R-2', 95, 180)] },
      { id: 'd-del-1-4', name: 'Nephrology', doctors: [createDoc('doc-del-4', 'Dr. S. Agarwal', 'Nephrologist', 'Block D, R-10', 50, 110)] },
      { id: 'd-del-1-5', name: 'Oncology', doctors: [createDoc('doc-del-5', 'Dr. R. Kapoor', 'Oncologist', 'Block E, R-3', 45, 95)] },
      { id: 'd-del-1-6', name: 'Pediatrics', doctors: [createDoc('doc-del-6', 'Dr. S. Verma', 'Pediatrician', 'Block F, R-1', 70, 140)] }
    ]
  },
  {
    id: 'h-jhk-rims',
    name: 'RIMS Ranchi',
    type: 'Government',
    state: 'Jharkhand',
    location: 'Bariatu, Ranchi',
    distance: 3.2,
    totalWaitingCount: 950,
    facilities: ["OPD", "Trauma", "Emergency", "Cardiology", "Neurology", "Burn Unit"],
    opdTimings: "08:30 AM - 04:00 PM",
    bedAvailability: { total: 1500, available: 20 },
    coordinates: { lat: 23.3857, lng: 85.3414 },
    departments: [
      { id: 'd-jhk-1', name: 'General Medicine', doctors: [createDoc('doc-jhk-1', 'Dr. S.P. Singh', 'Senior Physician', 'Room 101', 80, 160)] },
      { id: 'd-jhk-2', name: 'Cardiology', doctors: [createDoc('doc-jhk-2', 'Dr. Hemant Roy', 'Cardiologist', 'Room 205', 45, 90)] },
      { id: 'd-jhk-3', name: 'Orthopedics', doctors: [createDoc('doc-jhk-3', 'Dr. R.K. Pandey', 'Surgeon', 'Room 301', 60, 120)] },
      { id: 'd-jhk-4', name: 'Obstetrics', doctors: [createDoc('doc-jhk-4', 'Dr. Anita Sahay', 'Gynecologist', 'Room 402', 55, 115)] },
      { id: 'd-jhk-5', name: 'ENT', doctors: [createDoc('doc-jhk-5', 'Dr. Manoj Kumar', 'ENT Specialist', 'Room 105', 30, 75)] }
    ]
  },
  {
    id: 'h-wb-sskm',
    name: 'SSKM Hospital (IPGMER)',
    type: 'Government',
    state: 'West Bengal',
    location: 'AJC Bose Road, Kolkata',
    distance: 2.5,
    totalWaitingCount: 850,
    facilities: ["OPD", "Cardiology", "Emergency", "Burn Unit", "Nephrology", "X-Ray"],
    opdTimings: "09:00 AM - 04:00 PM",
    bedAvailability: { total: 2000, available: 45 },
    coordinates: { lat: 22.5391, lng: 88.3444 },
    departments: [
      { id: 'd-wb-1', name: 'Cardiology', doctors: [createDoc('doc-wb-1', 'Dr. Subhash Bose', 'Senior Cardiologist', 'Cardio Block R-1', 45, 102, 10)] },
      { id: 'd-wb-2', name: 'General Surgery', doctors: [createDoc('doc-wb-2', 'Dr. P.K. Chatterjee', 'Senior Surgeon', 'Surg Block R-12', 60, 150)] },
      { id: 'd-wb-3', name: 'Dermatology', doctors: [createDoc('doc-wb-3', 'Dr. S. Mukherjee', 'Skin Specialist', 'OPD-5', 40, 80)] },
      { id: 'd-wb-4', name: 'Chest & TB', doctors: [createDoc('doc-wb-4', 'Dr. A. Das', 'Pulmonologist', 'OPD-8', 35, 70)] },
      { id: 'd-wb-5', name: 'Psychiatry', doctors: [createDoc('doc-wb-5', 'Dr. T. Roy', 'Psychiatrist', 'OPD-2', 25, 50)] }
    ]
  },
  {
    id: 'h-mah-jj',
    name: 'Sir J.J. Hospital',
    type: 'Government',
    state: 'Maharashtra',
    location: 'Byculla, Mumbai',
    distance: 5.8,
    totalWaitingCount: 1800,
    facilities: ["OPD", "Emergency", "Research", "Forensic Labs", "Pediatrics", "Labs"],
    opdTimings: "08:00 AM - 04:00 PM",
    bedAvailability: { total: 2800, available: 15 },
    coordinates: { lat: 18.9633, lng: 72.8339 },
    departments: [
      { id: 'd-mah-1', name: 'Internal Medicine', doctors: [createDoc('doc-mah-1', 'Dr. Rajesh Patil', 'Senior Physician', 'R-202', 130, 425)] },
      { id: 'd-mah-2', name: 'Dermatology', doctors: [createDoc('doc-mah-2', 'Dr. Meena Iyer', 'Skin Specialist', 'Skin OPD Room 1', 55, 120)] },
      { id: 'd-mah-3', name: 'Ophthalmology', doctors: [createDoc('doc-mah-3', 'Dr. S. Kulkarni', 'Eye Surgeon', 'R-105', 40, 90)] },
      { id: 'd-mah-4', name: 'Urology', doctors: [createDoc('doc-mah-4', 'Dr. A. Deshmukh', 'Urologist', 'R-303', 30, 75)] },
      { id: 'd-mah-5', name: 'Neurosurgery', doctors: [createDoc('doc-mah-5', 'Dr. V. Shah', 'Neurosurgeon', 'Neuro Block', 20, 45)] }
    ]
  },
  {
    id: 'h-guj-civil',
    name: 'Civil Hospital, Ahmedabad',
    type: 'Government',
    state: 'Gujarat',
    location: 'Asarwa, Ahmedabad',
    distance: 4.5,
    totalWaitingCount: 1200,
    facilities: ["OPD", "Emergency", "Trauma", "Kidney Hospital", "Cancer Institute", "Ophthalmology"],
    opdTimings: "08:30 AM - 04:30 PM",
    bedAvailability: { total: 2000, available: 32 },
    coordinates: { lat: 23.0515, lng: 72.5954 },
    departments: [
      { id: 'd-guj-1', name: 'General Medicine', doctors: [createDoc('doc-guj-1', 'Dr. Pankaj Shah', 'Senior Physician', 'OPD Block 1', 75, 150)] },
      { id: 'd-guj-2', name: 'Pediatrics', doctors: [createDoc('doc-guj-2', 'Dr. Hema Patel', 'Pediatrician', 'Block B Room 10', 40, 85)] },
      { id: 'd-guj-3', name: 'ENT', doctors: [createDoc('doc-guj-3', 'Dr. B. Zala', 'ENT Specialist', 'OPD Block 2', 30, 65)] },
      { id: 'd-guj-4', name: 'Oncology', doctors: [createDoc('doc-guj-4', 'Dr. M. Mehta', 'Oncologist', 'Cancer Wing', 50, 110)] },
      { id: 'd-guj-5', name: 'Endocrinology', doctors: [createDoc('doc-guj-5', 'Dr. R. Patel', 'Endocrinologist', 'OPD Block 3', 25, 55)] }
    ]
  }
];

export const MOCK_HOSPITALS: Hospital[] = [
  ...BASE_HOSPITALS,
  // Government Hospitals
  ...generateHospitals('Delhi', 4, 'del-gov', 'Government'),
  ...generateHospitals('West Bengal', 5, 'wb-gov', 'Government'),
  ...generateHospitals('Maharashtra', 6, 'mah-gov', 'Government'),
  ...generateHospitals('Karnataka', 5, 'kar-gov', 'Government'),
  ...generateHospitals('Tamil Nadu', 5, 'tn-gov', 'Government'),
  ...generateHospitals('Kerala', 4, 'ker-gov', 'Government'),
  ...generateHospitals('Uttar Pradesh', 8, 'up-gov', 'Government'),
  ...generateHospitals('Gujarat', 7, 'guj-gov', 'Government'),
  ...generateHospitals('Jharkhand', 6, 'jhk-gov', 'Government'),
  
  // Northeast Indian States - Government
  ...generateHospitals('Assam', 10, 'asm-gov', 'Government'),
  ...generateHospitals('Sikkim', 4, 'skm-gov', 'Government'),
  ...generateHospitals('Mizoram', 4, 'miz-gov', 'Government'),
  ...generateHospitals('Manipur', 5, 'mnp-gov', 'Government'),
  ...generateHospitals('Nagaland', 4, 'nag-gov', 'Government'),
  ...generateHospitals('Arunachal Pradesh', 5, 'arp-gov', 'Government'),

  // Private Hospitals Section (100+)
  ...generateHospitals('Assam', 8, 'asm-pvt', 'Private'),
  ...generateHospitals('Sikkim', 2, 'skm-pvt', 'Private'),
  ...generateHospitals('Manipur', 3, 'mnp-pvt', 'Private'),
  ...generateHospitals('Maharashtra', 10, 'mah-pvt', 'Private'),
  ...generateHospitals('Karnataka', 10, 'kar-pvt', 'Private'),
  ...generateHospitals('Tamil Nadu', 10, 'tn-pvt', 'Private'),
  ...generateHospitals('Delhi', 8, 'del-pvt', 'Private'),
  ...generateHospitals('Telangana', 8, 'tel-pvt', 'Private'),
  ...generateHospitals('Gujarat', 8, 'guj-pvt', 'Private'),
  ...generateHospitals('Kerala', 8, 'ker-pvt', 'Private'),
  ...generateHospitals('Uttar Pradesh', 8, 'up-pvt', 'Private'),
  ...generateHospitals('Rajasthan', 6, 'raj-pvt', 'Private'),
  ...generateHospitals('Haryana', 6, 'har-pvt', 'Private'),
  ...generateHospitals('Punjab', 4, 'pun-pvt', 'Private'),
  ...generateHospitals('West Bengal', 6, 'wb-pvt', 'Private'),
  ...generateHospitals('Jharkhand', 5, 'jhk-pvt', 'Private')
];

export const MOCK_AMBULANCES: Ambulance[] = [
  { id: 'a1', regNo: 'DL 01 G 1234', type: 'ALS (Advanced Life Support)', status: 'Available', hospitalId: 'h-del-aiims', hospitalName: 'AIIMS Delhi', driverName: 'Ramesh Singh', driverPhone: '9988776655', distance: 1.5 },
  { id: 'a2', regNo: 'AS 01 H 5678', type: 'BLS (Basic Life Support)', status: 'Available', hospitalId: 'h-government-asm-gov-1', hospitalName: 'District Hospital, Guwahati', driverName: 'Suresh Gogoi', driverPhone: '8877665544', distance: 2.8 },
  { id: 'a3', regNo: 'MH 01 J 9101', type: 'Cardiac', status: 'Available', hospitalId: 'h-mah-jj', hospitalName: 'Sir J.J. Hospital', driverName: 'Abdul Khan', driverPhone: '7766554433', distance: 0.5 },
  { id: 'a4', regNo: 'SK 04 K 1122', type: 'ALS (Advanced Life Support)', status: 'Available', hospitalId: 'h-government-skm-gov-1', hospitalName: 'Gangtok Central Hospital', driverName: 'Karma Tsering', driverPhone: '6655443322', distance: 4.2 },
  { id: 'a5', regNo: 'MN 05 L 3344', type: 'BLS (Basic Life Support)', status: 'Available', hospitalId: 'h-private-mnp-pvt-1', hospitalName: 'Imphal Apollo Hospital', driverName: 'L. Singh', driverPhone: '5544332211', distance: 3.1 },
  { id: 'a6', regNo: 'GJ 01 AM 9988', type: 'Cardiac', status: 'Available', hospitalId: 'h-guj-civil', hospitalName: 'Civil Hospital, Ahmedabad', driverName: 'Bharat Patel', driverPhone: '9900887766', distance: 2.1 },
];

export const MOCK_HISTORY: Token[] = [
  {
    id: 'hist1',
    tokenNumber: 45,
    patientName: 'John Doe',
    patientPhone: '9876543210',
    hospitalId: 'h-del-aiims',
    hospitalName: 'AIIMS Delhi',
    departmentName: 'General Medicine',
    doctorName: 'Dr. Ankit Gupta',
    status: 'Completed',
    bookedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    estimatedTime: '10:30 AM',
    slotTime: '10:00 AM - 11:00 AM'
  }
];
