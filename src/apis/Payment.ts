/* eslint-disable no-console */
/* eslint-disable camelcase */
import nodeFetch from 'node-fetch';

import Env from '../utils/Env';
import AppError from '../errors';

const handleFetch = async (endpoint: string, method: string, body: any): Promise<object> => {
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

interface Customer {
    email: string;
    phone_number: number;
    name: string;
}

interface DispatchPayment {
    tx_ref: string;
    amount: number;
    endpoint: string;
    customer: Customer;
}
export default class Payment {
  customFetch: Function;

  constructor(customFetch = handleFetch) {
    this.customFetch = customFetch;
  }

  async dispatchPayment({
    tx_ref, amount, customer, endpoint,
  }: DispatchPayment) {
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
    return this.customFetch(endpoint, method, body);
  }
}
