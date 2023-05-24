// const multer = require("multer");
// const express = require("express");

// const MIME_TYPES = {
//    "image/jpg": "jpg",
//    "image/jpeg": "jpg",
//    "image/png": "png",
// };

// const storage = multer.diskStorage({

//    destination: (req, file, callback) => {
//       callback(null, "images");
//    },
//    filename: (req, file, callback) => {
//       const name = file.originalname.split(" ").join("_");
//       const extension = MIME_TYPES[file.mimetype];
//       callback(null, name + Date.now() + "." + extension);
//    },
// });

// module.exports = multer({ storage: storage }).single("image");

const multer = require("multer");
const sharp = require("sharp");

const MIME_TYPES = {
   "image/jpg": "jpg",
   "image/jpeg": "jpg",
   "image/png": "png",
};

const storage = multer.diskStorage({
   destination: (req, file, callback) => {
      callback(null, "images");
   },
   filename: (req, file, callback) => {
      const name = file.originalname.split(" ").join("_");
      const extension = MIME_TYPES[file.mimetype];
      callback(null, name + Date.now() + "." + extension);
   },
});

const fileFilter = (req, file, callback) => {
   if (file.mimetype.startsWith("image/")) {
      callback(null, true);
   } else {
      callback(new Error("Le fichier doit être une image valide."), false);
   }
};

const upload = multer({
   storage: storage,
   fileFilter: fileFilter,
   limits: {
      fileSize: 1024 * 1024, // Limite de taille : 1Mo
   },
});

const compressImage = async (req, res, next) => {
   if (!req.file) {
      return next();
   }

   try {
      await sharp(req.file.path)
         .resize(800, 800) // Redimensionner l'image selon vos besoins
         .webp({ quality: 80 }) // Convertir en WebP avec une qualité de 80
         .toFile(`images/compressed_${req.file.filename}.webp`);
      next();
   } catch (error) {
      next(error);
   }
};

module.exports = {
   upload: upload,
   compressImage: compressImage,
};
