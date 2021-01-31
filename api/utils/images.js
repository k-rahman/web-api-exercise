const fs = require('fs');

const removeImages = images => {
  try {
    images.forEach(img => {
      fs.unlinkSync(`public/uploads/${img}`);
    });
  }
  catch (e) {
    return 'Image deletion went wrong!';
  }
};


module.exports = removeImages;