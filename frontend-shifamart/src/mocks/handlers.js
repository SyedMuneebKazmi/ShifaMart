import { http, HttpResponse, delay } from 'msw';

export const handlers = [
  // Auth Handlers
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json();
    await delay(500);

    if (email === 'admin@shifamart.com' && password === 'admin123') {
      return HttpResponse.json({
        token: 'mock-jwt-token-admin',
        user: {
          id: 'admin-1',
          name: 'System Admin',
          email: 'admin@shifamart.com',
          role: 'admin'
        }
      });
    }

    if (email === 'doctor@shifamart.com' && password === 'doctor123') {
      return HttpResponse.json({
        token: 'mock-jwt-token-doctor',
        user: {
          id: 'doc-1',
          name: 'Dr. Sarah Ahmed',
          email: 'doctor@shifamart.com',
          role: 'doctor'
        }
      });
    }

    if (email === 'pharmacy@shifamart.com' && password === 'pharmacy123') {
      return HttpResponse.json({
        token: 'mock-jwt-token-pharmacy',
        user: {
          id: 'pharm-1',
          name: 'HealthPlus Pharmacy',
          email: 'pharmacy@shifamart.com',
          role: 'pharmacy'
        }
      });
    }

    // Default to patient for any other valid login
    if (password.length >= 6) {
      return HttpResponse.json({
        token: 'mock-jwt-token-patient',
        user: {
          id: 'pat-1',
          name: 'Ali Khan',
          email,
          role: 'patient'
        }
      });
    }

    return new HttpResponse(null, { status: 401, statusText: 'Invalid credentials' });
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const data = await request.json();
    await delay(800);
    
    return HttpResponse.json({
      token: `mock-jwt-token-${data.role}`,
      user: {
        id: Date.now().toString(),
        ...data
      }
    });
  }),

  // AI Handlers
  http.post('/api/ai/predict', async () => {
    await delay(1500);
    return HttpResponse.json({
      predictions: [
        { disease: 'Viral Upper Respiratory Infection', confidence: 0.85, severity: 'mild' },
        { disease: 'Acute Pharyngitis', confidence: 0.45, severity: 'moderate' }
      ],
      suggested_action: 'Rest and hydration. Consult a doctor if symptoms persist.',
      urgent: false
    });
  }),

  // Medicine Handlers
  http.post('/api/medicine/compare', async () => {
    await delay(1000);
    return HttpResponse.json({
      results: [
        {
          id: 1,
          pharmacy: 'HealthPlus Pharmacy',
          distance: '0.8 km',
          totalPrice: 450,
          availability: 'In Stock',
          items: [
            { name: 'Amoxicillin', price: 150, stock: true },
            { name: 'Paracetamol', price: 50, stock: true }
          ]
        }
      ]
    });
  }),

  // OCR Handlers
  http.post('/api/ocr/analyze', async () => {
    await delay(2000);
    return HttpResponse.json({
      text: "Rx\nAmoxicillin 500mg - 1 tab twice daily\nParacetamol 500mg - 1 tab SOS",
      medicines: [
        { name: 'Amoxicillin', dosage: '500mg', quantity: '20' },
        { name: 'Paracetamol', dosage: '500mg', quantity: '10' }
      ],
      confidence: 0.92
    });
  }),
];
