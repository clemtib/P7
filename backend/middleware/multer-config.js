const multer = require("multer");

const storage = multer.memoryStorage();
module.exports = multer({ storage: storage }).single("image");
//enregistrement des fichier telechargé sous forme de tampon
