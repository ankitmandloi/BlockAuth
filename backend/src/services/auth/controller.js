import ethUtil from 'ethereumjs-util';
import sigUtil from 'eth-sig-util';
import jwt from 'jsonwebtoken';

import config from '../../config';
import db from '../../db';

const User = db.models.User;

export const create = (req, res, next) => {
  const { signature, publicAddress } = req.body;
  if (!signature || !publicAddress)
    return res
      .status(400)
      .send({ error: 'Request should have signature and publicAddress' });

  return (
    User.findOne({ where: { publicAddress } })

      .then(user => {
        if (!user)
          return res.status(401).send({
            error: `User with publicAddress ${publicAddress} is not found in database`
          });
        return user;
      })
  
      .then(user => {
        const msg = `I am signing my one-time nonce: ${user.nonce}`;

        
        const msgBufferHex = ethUtil.bufferToHex(Buffer.from(msg, 'utf8'));
        const address = sigUtil.recoverPersonalSignature({data: msgBufferHex, sig: signature})

        if (address.toLowerCase() === publicAddress.toLowerCase()) {
          return user;
        } else {
          return res
            .status(401)
            .send({ error: 'Signature verification failed' });
        }
      })
  
      .then(user => {
        user.nonce = Math.floor(Math.random() * 10000);
        return user.save();
      })

      .then(
        user =>
          new Promise((resolve, reject) =>
            // https://github.com/auth0/node-jsonwebtoken
            jwt.sign(
              {
                payload: {
                  id: user.id,
                  publicAddress
                }
              },
              config.secret,
              null,
              (err, token) => {
                if (err) {
                  return reject(err);
                }
                return resolve(token);
              }
            )
          )
      )
      .then(accessToken => res.json({ accessToken }))
      .catch(next)
  );
};
