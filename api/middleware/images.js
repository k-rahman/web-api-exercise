const multer = require('multer');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const upload = multer({ dest: './public/uploads/' });

const getImages = (req, res, next) => {
  upload.array('images', 4)(req, res, () => {
    try {
      req.body.images = req.files.map(file => {
        fs.rename(file.path, `${file.destination}${uuidv4()}-${file.originalname}`, _ => { })
        return `${file.destination}${uuidv4()}-${file.originalname}`
      });
    }
    catch (e) {
      console.log(e);
    }

    next();
  });
};


module.exports = getImages;