const axios = require('axios');
var FormData = require('form-data');
const multer = require('multer');
const fs = require('fs');
const upload = multer({ dest: './public/uploads/' });

const getImages = (req, res, next) => {
  upload.array('images', 4)(req, res, () => {
    try {
      req.body.images = req.files.map(file => {
        fs.rename(file.path, `${file.destination}${file.filename}-${file.originalname}`, _ => { })
        return `${file.filename}-${file.originalname}`;
      });
    }
    catch (e) {
      // console.log('images are missing!');
    }



    next();
  });
};

// saving on different server because deploying to Heroku removes files
const saveImages = (req, res, next) => {
  var form = new FormData();

  req.files.forEach(file =>
    form.append('images', fs.createReadStream(`${file.path}-${file.originalname}`))
  );
  axios.post('http://abdelrahman.ddns.net:8880', form, { headers: form.getHeaders() });

  next();
};


module.exports = {
  getImages,
  saveImages
};