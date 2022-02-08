import express, {
  json, urlencoded,
} from 'express';
import logger from 'morgan';
import cors from 'cors';

import routes from './routes/router';
import swaggerSpec from './utils/swagger';
import errorHandlers from './controllers/errorHandlers';

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use('/api-docs', swaggerSpec.serve, swaggerSpec.setup);

app.use('/api/v1', routes);

app.get('', (req, res) => { res.redirect('/api-docs'); });

app.use(...errorHandlers);

export default app;
