import crypto from 'crypto';
import { HttpError } from '../utils/http-error.js';

class RobokassaService {
  private readonly merchantLogin = process.env.ROBOKASSA_LOGIN!;

  private readonly password1 = process.env.ROBOKASSA_PASSWORD1!;

  private readonly password2 = process.env.ROBOKASSA_PASSWORD2!;

  private readonly isTest = process.env.ROBOKASSA_TEST_MODE === 'true';

  private readonly baseUrl = 'https://auth.robokassa.ru/Merchant/Index.aspx';

  requireConfiguration(): void {
    if (!this.merchantLogin || !this.password1 || !this.password2) throw new HttpError('Оплата временно недоступна', 503);
  }

  private md5(value: string): string {
    return crypto.createHash('md5').update(value).digest('hex');
  }

  createPaymentUrl(paymentId: number, amount: number, description: string): string {
    this.requireConfiguration();
    const signature = this.md5(`${this.merchantLogin}:${amount}:${paymentId}:${this.password1}`);

    const params = new URLSearchParams({
      MerchantLogin: this.merchantLogin,
      OutSum: amount.toString(),
      InvId: paymentId.toString(),
      Description: description,
      SignatureValue: signature,
    });

    if (this.isTest) {
      params.append('IsTest', '1');
    }

    return `${this.baseUrl}?${params.toString()}`;
  }

  verifyResultSignature(amount: string, paymentId: string, signature: string): boolean {
    this.requireConfiguration();
    const expected = this.md5(`${amount}:${paymentId}:${this.password2}`);

    if (!/^[a-fA-F0-9]{32}$/.test(signature)) return false;
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
  }

  verifySuccessSignature(amount: string, paymentId: string, signature: string): boolean {
    const expected = this.md5(`${amount}:${paymentId}:${this.password1}`);

    return expected.toUpperCase() === signature.toUpperCase();
  }
}

export default new RobokassaService();
