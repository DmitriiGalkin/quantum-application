ALTER TABLE payment
  MODIFY provider ENUM('yookassa', 'cloudpayments', 'tbank', 'stripe', 'paypal', 'robokassa') NOT NULL;
