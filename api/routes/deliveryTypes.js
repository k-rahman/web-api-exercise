const express = require('express');
const router = express.Router();
const deliveryTypes = require('../services/deliveryTypes');

router.get('/', (req, res) => {
  try {
    deliveryTypes
      .getAllDeliveryTypes()
      .then(result => res.status(200).send(result))
      .catch(e => e.name === 404 ?
        res.status(404).send({ code: '404', message: e.message }) :
        res.sendStatus(500)
      );
  }
  catch (e) {
    res.sendStatus(500);
  }
});


module.exports = router;