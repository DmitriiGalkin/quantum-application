import { beforeEach, expect, it, vi } from 'vitest';
import type { Payment, RefundOperation } from 'entities';
vi.mock('../repositories/refund.repository.js',()=>({RefundRepository:{pending:vi.fn(),claim:vi.fn(),set:vi.fn(),attention:vi.fn()}}));
vi.mock('../repositories/payment.repository.js',()=>({default:{getById:vi.fn(),setProviderPaymentId:vi.fn()}}));
import { RefundRepository } from '../repositories/refund.repository.js';
import Payments from '../repositories/payment.repository.js';
import { RefundService } from './refund.service.js';
beforeEach(()=>{
  vi.resetAllMocks();
  vi.mocked(RefundRepository.attention).mockResolvedValue([]);
  vi.stubEnv('ROBOKASSA_PASSWORD3','test-secret'); vi.stubEnv('ROBOKASSA_TEST_MODE','false');
  vi.mocked(Payments.getById).mockResolvedValue({id:7,status:'paid',provider:'robokassa',providerPaymentId:'0005F891-8CCD-434B-8455-816AFFFDBF37-0VOisWikFF',amount:500} as Payment);
});
it('never retries a refund submission after a lost network response',async()=>{
  vi.mocked(RefundRepository.pending).mockResolvedValue([{id:1,paymentId:7,status:'queued',requestId:null,error:null}]);
  vi.mocked(RefundRepository.claim).mockResolvedValue(true);
  const request=vi.fn().mockRejectedValue(new Error('Connection lost'));vi.stubGlobal('fetch',request);
  await RefundService.dispatch();
  expect(request).toHaveBeenCalledTimes(1);
  expect(RefundRepository.set).toHaveBeenCalledWith(1,'uncertain',null,expect.any(String));
  vi.mocked(RefundRepository.pending).mockResolvedValue([]);
  await RefundService.dispatch(); expect(request).toHaveBeenCalledTimes(1);
  vi.unstubAllGlobals();vi.unstubAllEnvs();
});
it('polls the existing request instead of resubmitting a processing refund',async()=>{
  vi.mocked(RefundRepository.pending).mockResolvedValue([{id:1,paymentId:7,status:'processing',requestId:'known-id'} as RefundOperation]);
  const request=vi.fn().mockResolvedValue(new Response(JSON.stringify({label:'processing'})));vi.stubGlobal('fetch',request);
  await RefundService.dispatch();
  expect(request.mock.calls[0][0]).toContain('/GetState?id=known-id');
  expect(RefundRepository.claim).not.toHaveBeenCalled();
  vi.unstubAllGlobals();vi.unstubAllEnvs();
});
