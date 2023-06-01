const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const sharp = require("../middleware/sharp-config");

const bookCtrl = require("../controllers/book");

router.get("/", bookCtrl.getAllBooks);
router.post("/", auth, multer, sharp, bookCtrl.createBook);
router.get("/bestrating", bookCtrl.getBestRating);
router.get("/:id", bookCtrl.getOneBook);
router.put("/:id", auth, multer, sharp, bookCtrl.modifyBook);
router.post("/:id/rating", auth, bookCtrl.addRating);
router.delete("/:id", auth, bookCtrl.deleteBook);

module.exports = router;
