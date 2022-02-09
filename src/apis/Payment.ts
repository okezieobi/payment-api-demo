/* eslint-disable no-console */
/* eslint-disable camelcase */
import nodeFetch from 'node-fetch';
import Ajv from 'ajv';
import ajvFormats from 'ajv-formats';
import ajvKeywords from 'ajv-keywords';

import Env from '../utils/Env';
import AppError from '../errors';

const ajv = new Ajv({ allErrors: true });

ajvFormats(ajv);
ajvKeywords(ajv);

interface Customer {
    email: string;
    phone_number: number;
    name: string;
}

interface DispatchPayment {
    tx_ref: string;
    amount: string;
    customer: Customer;
}

interface ApiResponseData {
    tx_ref: string;
    flw_ref: string;
    id: number;
}
interface ApiResponse {
  status?: string;
  message?: string;
}
interface ApiSuccessResponse extends ApiResponse {
  data: ApiResponseData;
}

interface VerifyTransaction extends ApiResponse {
  transaction_id?: number;
  data?: object;
}

const handleFetch = async (endpoint: string, method: string, body: any):
  Promise<ApiSuccessResponse> => {
  const env = new Env();
  const options = {
    method,
    body,
    headers: {
      Authorization: `Bearer ${env.flutterwave.secret}`,
      'Content-Type': 'application/json',
    },
  };
  const data = await nodeFetch(`https://api.flutterwave.com/v3/${endpoint}`, options);
  const response: any = await data.json();
  if (response.status === 'error') {
    throw new AppError(response.message, 'Payment', response.data);
  }
  return response;
};
export default class Payment {
  customFetch: Function;

  constructor(customFetch = handleFetch) {
    this.customFetch = customFetch;
    this.dispatchPayment = this.dispatchPayment.bind(this);
    this.verifyTransaction = this.verifyTransaction.bind(this);
  }

  static async validateInitiateTransaction(data: DispatchPayment) {
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
    return schema(data);
  }

  async dispatchPayment({
    tx_ref, amount, customer,
  }: DispatchPayment): Promise<ApiSuccessResponse> {
    await Payment.validateInitiateTransaction({ tx_ref, amount, customer });
    const method = 'POST';
    let redirect_url;
    const redirect_endpoint = 'verified-transaction';
    switch (process.env.NODE_ENV) {
      case 'production':
        redirect_url = `https://payment-api-app.herokuapp.com/api/v1/${redirect_endpoint}`;
        break;
      default:
        redirect_url = `http://localhost:5000/api/v1/${redirect_endpoint}`;
    }
    const body = JSON.stringify({
      tx_ref,
      amount,
      currency: 'NGN',
      redirect_url,
      payment_options: 'card',
      customer,
      meta: {},
      customizations: {
        title: 'Payment API demo checkout',
        description: '',
        logo: '',
      },
    });
    return this.customFetch('payments', method, body);
  }

  async verifyTransaction({
    status = 'successful', message, transaction_id, data,
  }: VerifyTransaction): Promise<ApiSuccessResponse> {
    if (status !== 'successful') {
      throw new AppError(message, 'Payment', data);
    }
    const endpoint = `transactions/${transaction_id}/verify`;
    return this.customFetch(endpoint);
  }
}
