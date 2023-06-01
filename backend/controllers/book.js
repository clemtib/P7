const Book = require("../models/Book");

const fs = require("fs");

exports.createBook = (req, res, next) => {
   const bookObject = JSON.parse(req.body.book);
   delete bookObject._id;
   delete bookObject._userId;
   const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get("host")}/images/${
         req.file.filename
      }`,
   });

   book
      .save()
      .then(() => {
         res.status(201).json({ message: "Objet enregistré !" });
      })
      .catch((error) => {
         console.log("Erreur d'envoie");
         res.status(400).json({ error });
      });
};

exports.modifyBook = (req, res, next) => {
   Book.findOne({ _id: req.params.id })
      .then((book) => {
         if (req.file) {
            const bookObject = {
               ...JSON.parse(req.body.book),
               imageUrl: `${req.protocol}://${req.get("host")}/images/${
                  req.file.filename
               }`,
            };
            if (book.userId != req.auth.userId) {
               res.status(401).json({ message: "Non-autorisé" });
            } else {
               const fileToDelete = book.imageUrl.split("/images/")[1];
               //supression de l'ancienne image
               fs.unlink(`images/${fileToDelete}`, () => {
                  Book.updateOne(
                     { _id: req.params.id },
                     { ...bookObject, _id: req.params.id }
                  )
                     .then(() =>
                        res.status(200).json({ message: "Livre modifié !" })
                     )
                     .catch((error) => {
                        res.status(400).json({ error });
                     });
               });
            }
         } else {
            const bookObject = {
               ...req.body,
            };
            if (book.userId != req.auth.userId) {
               res.status(401).json({ message: "Non-autorisé" });
            } else {
               Book.updateOne(
                  { _id: req.params.id },
                  { ...bookObject, _id: req.params.id }
               )
                  .then(() =>
                     res.status(200).json({ message: "Livre modifié !" })
                  )
                  .catch((error) => {
                     res.status(400).json({ error });
                  });
            }
         }
      })
      .catch((error) => {
         res.status(400).json({ error });
      });
};

exports.deleteBook = (req, res, next) => {
   Book.findOne({ _id: req.params.id })
      .then((book) => {
         if (book.userId != req.auth.userId) {
            res.status(401).json({ message: "Not authorized" });
         } else {
            const filename = book.imageUrl.split("/images/")[1];
            fs.unlink(`images/${filename}`, () => {
               Book.deleteOne({ _id: req.params.id })
                  .then(() => {
                     res.status(200).json({ message: "Objet supprimé !" });
                  })
                  .catch((error) => res.status(401).json({ error }));
            });
         }
      })
      .catch((error) => {
         res.status(500).json({ error });
      });
};

exports.getOneBook = (req, res, next) => {
   Book.findOne({
      _id: req.params.id,
   })
      .then((book) => {
         res.status(200).json(book);
      })
      .catch((error) => {
         res.status(404).json({
            error,
         });
      });
};

exports.getAllBooks = (req, res, next) => {
   Book.find()
      .then((books) => {
         res.status(200).json(books);
      })
      .catch((error) => {
         res.status(400).json({
            error,
         });
      });
};

exports.addRating = (req, res, next) => {
   const bookId = req.params.id;
   const ratingObject = req.body;
   ratingObject.grade = ratingObject.rating;
   delete ratingObject.rating;

   Book.findByIdAndUpdate(
      bookId,
      { $push: { ratings: ratingObject } },
      { new: true }
   )
      .then((book) => {
         const averageRating =
            book.ratings.reduce((sum, rating) => sum + rating.grade, 0) /
            book.ratings.length;

         const roundedRating = Number(averageRating.toFixed(1));

         return Book.findByIdAndUpdate(
            bookId,
            { averageRating: roundedRating },
            { new: true }
         );
      })
      .then((updatedBook) => {
         res.status(200).json(updatedBook);
      })
      .catch((error) => {
         res.status(400).json({ error });
      });
};

exports.getBestRating = (req, res, next) => {
   Book.find()
      .sort({ averageRating: -1 })
      .limit(3)
      .then((books) => {
         res.json(books);
      })
      .catch((err) => {
         console.error(err);
         res.status(500).json({
            error: "Une erreur est survenue lors de la récupération des livres.",
         });
      });
};
