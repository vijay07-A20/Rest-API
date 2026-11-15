import { Router } from 'express';
import { successResponse } from '../utils/responseFormatter.js';

const router = Router();

const sampleProducts = [
  { id: 'prod_101', name: 'Cloud API Gateway License', category: 'Infrastructure', price: 299 },
  { id: 'prod_102', name: 'DFA Automata Analyzer SDK', category: 'Software', price: 149 },
  { id: 'prod_103', name: 'Network Traffic Inspector', category: 'Security', price: 499 },
  { id: 'prod_104', name: 'Rate Limit Sentinel Node', category: 'Security', price: 199 },
];

router.get('/products', (req, res) => {
  return successResponse(res, {
    count: sampleProducts.length,
    products: sampleProducts,
  }, 'Sample protected product catalog retrieved');
});

router.get('/products/:id', (req, res) => {
  const prod = sampleProducts.find(p => p.id === req.params.id);
  if (!prod) {
    return res.status(404).json({
      success: false,
      message: `Product with ID '${req.params.id}' not found.`,
      classification: 'Warning',
    });
  }
  return successResponse(res, prod, 'Product details retrieved');
});

router.post('/orders', (req, res) => {
  const orderId = `ord_${Date.now()}`;
  return successResponse(res, {
    orderId,
    status: 'CONFIRMED',
    itemsCount: 1,
    processedAt: new Date().toISOString(),
  }, 'Simulated order created successfully', 201);
});

router.get('/profile', (req, res) => {
  return successResponse(res, {
    userId: 'usr_7728',
    role: 'API_CONSUMER',
    tier: req.headers['x-api-tier'] || 'STANDARD',
    accountActive: true,
  }, 'User profile retrieved');
});

// Sensitive / Restricted endpoint to trigger explainable abuse rule
router.get('/admin/dashboard', (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'Access Denied: Administrative privilege required.',
    error: 'HTTP 403 Forbidden',
    classification: 'Suspicious',
  });
});

export default router;
