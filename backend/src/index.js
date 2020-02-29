import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import services from './services';

const app = express();


app.use(bodyParser.json());
app.use(cors());

app.use('/api', services);

app.listen(8000, () => console.log('Ankit Mandloi is awesome'));
