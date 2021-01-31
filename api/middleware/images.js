const multer = require('multer');
const fs = require('fs');
const upload = multer({ dest: './public/uploads/' });
const validate = require('../middleware/validate').validateNewItem;

const getImages = (req, res, next) => {
  upload.array('images', 4)(req, res, () => {
    try {
      req.body.images = req.files.map(file => {
        fs.rename(file.path, `${file.destination}${file.filename}-${file.originalname}`, _ => { })
        return `${file.filename}-${file.originalname}`;
      });
    }
    catch (e) {
      console.log(e);
    }

    next();
  });
};


module.exports = getImages;