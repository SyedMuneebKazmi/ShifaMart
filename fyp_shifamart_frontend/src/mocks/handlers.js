import { http, HttpResponse, delay } from 'msw';

export const handlers = [
// NOTE: Auth routes (login/register) are NOT mocked here so they hit the real backend.
// AI routes (/api/ai/*) are NOT mocked — they proxy through to the Node.js backend
// which then forwards to the Python AI agent on :8000.
// The MSW worker is set to 'onUnhandledRequest: bypass' which lets them pass through.

  // OCR Handlers — only kept as fallback since PrescriptionUpload uses client-side Tesseract
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
