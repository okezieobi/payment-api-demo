/* eslint-disable camelcase */
import Ajv from 'ajv';
import ajvFormats from 'ajv-formats';
import ajvKeywords from 'ajv-keywords';

const ajv = new Ajv({ allErrors: true });

ajvFormats(ajv);
ajvKeywords(ajv);

interface Customer {
    email: string;
    phone_number: number;
    name: string;
}

interface CreateTransaction {
    amount: string;
    tx_ref: string;
    customer: Customer;
}

export default class TransactionSchema implements CreateTransaction {
  amount: string;

  tx_ref: string;

  customer: Customer;

  constructor(amount: string, tx_ref: string, customer: Customer) {
    this.amount = amount;
    this.tx_ref = tx_ref;
    this.customer = customer;
  }

  async validateCreateTransaction() {
    const schema = ajv.compile({
      $async: true,
      type: 'object',
      allRequired: true,
      additionalProperties: false,
      properties: {
        amount: { type: 'string' },
        tx_ref: { type: 'string', format: 'uuid' },
        customer: { type: 'object' },
      },
    });
    return schema(this);
  }
}
