import crypto from 'crypto';

class RobokassaService {
  private readonly merchantLogin = process.env.ROBOKASSA_LOGIN!;

  private readonly password1 = process.env.ROBOKASSA_PASSWORD1!;

  private readonly password2 = process.env.ROBOKASSA_PASSWORD2!;

  private readonly isTest = process.env.ROBOKASSA_TEST_MODE === 'true';

  private readonly baseUrl = 'https://auth.robokassa.ru/Merchant/Index.aspx';

  private md5(value: string): string {
    return crypto.createHash('md5').update(value).digest('hex');
  }

  createPaymentUrl(paymentId: number, amount: number, description: string): string {
    const signature = this.md5(`${this.merchantLogin}:${amount}:${paymentId}:${this.password1}`);

    console.log(process.env.ROBOKASSA_LOGIN, 'process.env.ROBOKASSA_LOGIN');
    console.log(this.merchantLogin, 'this.merchantLogin');

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
    const expected = this.md5(`${amount}:${paymentId}:${this.password2}`);

    return expected.toUpperCase() === signature.toUpperCase();
  }

  verifySuccessSignature(amount: string, paymentId: string, signature: string): boolean {
    const expected = this.md5(`${amount}:${paymentId}:${this.password1}`);

    return expected.toUpperCase() === signature.toUpperCase();
  }
}

export default new RobokassaService();
