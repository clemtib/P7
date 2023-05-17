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
   const bookObject = req.file
      ? {
           ...JSON.parse(req.body.book),
           imageUrl: `${req.protocol}://${req.get("host")}/images/${
              req.file.filename
           }`,
        }
      : { ...req.body };

   delete bookObject._userId;
   Book.findOne({ _id: req.params.id })
      .then((book) => {
         if (book.userId != req.auth.userId) {
            res.status(401).json({ message: "Not authorized" });
         } else {
            Book.updateOne(
               { _id: req.params.id },
               { ...bookObject, _id: req.params.id }
            )
               .then(() => res.status(200).json({ message: "Objet modifié!" }))
               .catch((error) => res.status(401).json({ error }));
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
   // .finally(() => {
   //    next();
   // });
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
   const ratingObject = req.body;
   ratingObject.grade = ratingObject.rating;
   delete ratingObject.rating;

   console.log(req.params.id);
   console.log(ratingObject);

   Book.updateOne({ _id: req.params.id }, { $push: { ratings: ratingObject } })
      .then(() => {
         // return getOneBook(req, res, next);

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
      })

      .catch((error) => {
         res.status(400).json({ error });
      });
};

exports.bestRating = (req, res, next) => {
   console.log("Hello Best Rating");
};
