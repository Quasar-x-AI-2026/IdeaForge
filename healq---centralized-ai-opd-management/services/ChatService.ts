
import { MOCK_HOSPITALS, MOCK_AMBULANCES } from '../constants';
import { Hospital, Doctor, Ambulance } from '../types';

export type ChatResponse = {
  text: string;
  suggestedHospitals?: Hospital[];
  suggestedDoctors?: Doctor[];
  action?: 'BOOKING_REDIRECT' | 'AMBULANCE_DISPATCH';
};

const SYMPTOM_MAP: Record<string, string> = {
  'heart': 'Cardiology',
  'chest pain': 'Cardiology',
  'breath': 'Pulmonology',
  'cough': 'Pulmonology',
  'skin': 'Dermatology',
  'rash': 'Dermatology',
  'acne': 'Dermatology',
  'stomach': 'Gastroenterology',
  'digest': 'Gastroenterology',
  'bone': 'Orthopedics',
  'fracture': 'Orthopedics',
  'joint': 'Orthopedics',
  'nerv': 'Neurology',
  'brain': 'Neurology',
  'kidney': 'Nephrology',
  'urinary': 'Urology',
  'child': 'Pediatrics',
  'baby': 'Pediatrics',
  'eye': 'Ophthalmology',
  'vision': 'Ophthalmology',
  'lady': 'Gynecology',
  'woman': 'Gynecology',
  'pregnant': 'Obstetrics',
  'cancer': 'Oncology',
  'sugar': 'Endocrinology',
  'diabetes': 'Endocrinology',
  'ent': 'ENT',
  'ear': 'ENT',
  'nose': 'ENT',
  'throat': 'ENT',
  'fever': 'General Medicine',
  'cold': 'General Medicine',
  'flu': 'General Medicine',
  'headache': 'General Medicine' // Or Neurology
};

export class ChatService {
  
  static async sendMessage(message: string, language: string = 'en'): Promise<ChatResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const lowerMsg = message.toLowerCase();

    // 1. Check for Emergency
    if (lowerMsg.includes('emergency') || lowerMsg.includes('accident') || lowerMsg.includes('ambulance') || lowerMsg.includes('bleeding')) {
        return {
            text: "This sounds like an emergency! 🚨 I can help you dispatch an ambulance immediately. Please go to the Ambulance section or call 108.",
            action: 'AMBULANCE_DISPATCH' // In a fuller implementation, this could trigger a UI action
        };
    }

    // 2. Identify Potential Department/Specialty
    let detectedDept: string | null = null;
    for (const [key, dept] of Object.entries(SYMPTOM_MAP)) {
      if (lowerMsg.includes(key)) {
        detectedDept = dept;
        break;
      }
    }

    // 3. Identify Location
    // Very simple extraction: check against hospital states/locations in our mock data
    let locationsInMsg: string[] = [];
    const allLocations = [...new Set(MOCK_HOSPITALS.map(h => h.state).concat(MOCK_HOSPITALS.map(h => h.location)))];
    
    // Breaking down message into words to check against locations might be too aggressive, 
    // let's just check if any known location string exists in the message.
    for (const loc of allLocations) {
        if (lowerMsg.includes(loc.toLowerCase())) {
            locationsInMsg.push(loc);
        }
    }
    
    // Also check for "near me" or "here"
    if (lowerMsg.includes('delhi')) locationsInMsg.push('Delhi'); // Hardcode common ones for testing if not caught above
    if (lowerMsg.includes('mumbai')) locationsInMsg.push('Maharashtra');
    if (lowerMsg.includes('bangalore') || lowerMsg.includes('bengaluru')) locationsInMsg.push('Karnataka');


    // 4. Formulate Response
    if (detectedDept) {
        // Filter Hospitals
        let relevantHospitals = MOCK_HOSPITALS.filter(h => 
            h.departments.some(d => d.name.toLowerCase().includes(detectedDept!.toLowerCase()))
        );

        // Filter by location if detected
        if (locationsInMsg.length > 0) {
            relevantHospitals = relevantHospitals.filter(h => 
                locationsInMsg.some(loc => h.state.toLowerCase().includes(loc.toLowerCase()) || h.location.toLowerCase().includes(loc.toLowerCase()))
            );
        }

        // Gather Doctors
        let suggestedDoctors: Doctor[] = [];
        let hospitalMap = new Map<string, Hospital>();

        relevantHospitals.forEach(h => {
            const dept = h.departments.find(d => d.name.toLowerCase().includes(detectedDept!.toLowerCase()));
            if (dept && dept.doctors.length > 0) {
                // Add hospital reference to doctor for context if needed, but doctor object doesn't have hospital ID directly usually, 
                // wait, the Doctor interface doesn't have hospitalId.
                // We'll return hospitals primarily, but if UI wants doctors we can extract them.
                // Let's attach the hospital name to the doctor statusMessage temporarily or just return the hospital + relevant department info.
                
                // Let's just return the doctors directly, but we need to know which hospital they belong to for booking.
                // The `Doctor` interface doesn't store hospital ID.
                // We should probably return the *Hospital* and let the UI show the doctor from that specific department.
                
                 dept.doctors.forEach(doc => {
                     // Add a temporary property or just rely on the UI to display it
                     // We will return hospitals, and the UI can show the relevant department's doctors.
                 });
            }
        });

        // Limit results
        const topHospitals = relevantHospitals.slice(0, 3);
        
        if (topHospitals.length > 0) {
            return {
                text: `I noticed you mentioned symptoms related to **${detectedDept}**. Here are some top specialists ${locationsInMsg.length > 0 ? 'near ' + locationsInMsg[0] : 'available'} for you. \n\nYou can book a token directly:`,
                suggestedHospitals: topHospitals,
                // We could also pass the specific department ID to pre-select it
            };
        } else {
             return {
                text: `I understand you need a **${detectedDept}** specialist, but I couldn't find any hospitals matching your location criteria in our database. Try searching for a different city.`,
            };
        }
    }

    // Default Fallback
    return {
      text: "I can help you find a doctor or book an appointment. Please tell me your symptoms and your location (e.g., 'Headache in Delhi').",
    };
  }
}
