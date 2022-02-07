/* eslint-disable no-console */
import mongoose from 'mongoose';

import Env from '../utils/Env';

const env = new Env();

// start mongo server with command 'sudo mongod --dbpath ~/data/db --replSet rs0'
mongoose.connect(
  env.databaseURL || '',
).catch(console.error);

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'review') {
  (async () => {
    // const models = {};
    // models.User = await (await import('./User')).default;
    // models.Store = await (await import('./Store')).default;
    // models.Addresses = await (await import('./Address')).UserAddress;
    // models.StoreAddress = await (await import('./Address')).StoreAddress;
    // models.Products = await (await import('./Product')).default;
    // models.Account = await (await import('./Account')).default;
    // models.Order = await (await import('./Order')).default;
    // models.Transaction = await (await import('./Transaction')).default;
    // Object.values(models).forEach(async (model) => {
    //   await model.deleteMany({}).exec().catch(console.error);
    // });
  })();
}

export default mongoose.connection;
