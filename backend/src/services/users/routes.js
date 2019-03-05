import jwt from 'express-jwt';
import express from 'express';

import config from '../../config';
import * as controller from './controller';

const router = express.Router();


router.route('/').get(controller.find);


router.route('/:userId').get(jwt({ secret: config.secret }), controller.get);


router.route('/').post(controller.create);


router
  .route('/:userId')
  .patch(jwt({ secret: config.secret }), controller.patch);

export default router;
