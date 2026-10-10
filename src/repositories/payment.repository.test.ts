import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('../utils/dbNext.js', () => ({ db: { execute: vi.fn() } }));
import PaymentRepository from './payment.repository.js';
import { db } from '../utils/dbNext.js';
import type { ResultSetHeader } from 'mysql2/promise';
import type { PaymentRow } from 'entities';

beforeEach(() => vi.resetAllMocks());
describe('payment confirmation persistence', () => {
  it('records the confirmation date only when transitioning a pending payment', async () => {
    vi.mocked(db.execute).mockResolvedValueOnce({ affectedRows: 1 } as ResultSetHeader);
    await PaymentRepository.setPaid(4);
    expect(db.execute).toHaveBeenCalledWith(expect.stringMatching(/paidAt = NOW\(\)[\s\S]*WHERE id = \? AND status = 'pending'/), [4]);
  });

  it('accepts a concurrently confirmed payment without overwriting its date', async () => {
    vi.mocked(db.execute)
      .mockResolvedValueOnce({ affectedRows: 0 } as ResultSetHeader)
      .mockResolvedValueOnce([{ status: 'paid', metadata: null } as PaymentRow]);
    await expect(PaymentRepository.setPaid(4)).resolves.toBeUndefined();
    expect(db.execute).toHaveBeenCalledTimes(2);
  });

  it('does not acknowledge a canceled payment when its status changed during confirmation', async () => {
    vi.mocked(db.execute)
      .mockResolvedValueOnce({ affectedRows: 0 } as ResultSetHeader)
      .mockResolvedValueOnce([{ status: 'canceled', metadata: null } as PaymentRow]);
    await expect(PaymentRepository.setPaid(4)).rejects.toThrow('Payment could not be confirmed');
  });
});
