const db = require('../db/index');
const error = require('../utils/errors');


const getAllDeliveryTypes = async _ => {

  const deliveryTypes = await db.query('SELECT * FROM deliveryTypes');

  if (deliveryTypes.length === 0)
    throw error(404, 'No deliveryTypes were found!');

  return deliveryTypes;
};

module.exports = {
  getAllDeliveryTypes
}