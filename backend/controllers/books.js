const Book = require('../models/Book')
const fs = require('fs')

// Create a new book
exports.createOneThing = (req, res, next) => {
	const thingObject = JSON.parse(req.body.book)
	delete thingObject._id
	delete thingObject._userId
	const thing = new Book({
		...thingObject,
		userId: req.auth.userId,
		imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
	})
	thing.save()
		.then(() => res.status(201).json({ message: 'Objet enregistré !' }))
		.catch((error) => { res.status(400).json({ error }) })
}

// Get all books
exports.getAllThings = (req, res, next) => {
	Book.find()
		.then(things => res.status(200).json(things))
		.catch(error => res.status(400).json({ error }))
}

// Get one book
exports.getOneThing = (req, res, next) => {
	Book.findById(req.params.id)
		.then(thing => res.status(200).json(thing))
		.catch(error => res.status(404).json({ error }))
}

// Add a rating
exports.rateOneThing = (req, res, next) => {
	const newRating = { userId: req.auth.userId, grade: req.body.rating }
	Book.findByIdAndUpdate(
		req.params.id,
		[{
			$set: {
				ratings: { $concatArrays: ['$ratings', [newRating]] }, // Ajout de la nouvelle note
				averageRating: {
					$round: [{ $avg: { $concatArrays: ['$ratings.grade', [newRating.grade]] } }, 2]
				}
			}
		}],
		{ new: true, runValidators: true }
	)
		.then(book => {
			if (!book) return res.status(404).json({ error: 'Book not found' })
			res.status(200).json(book)
		})
		.catch(error => res.status(400).json({ error }))
}

// Get the 3 books with the best ratings (highest averageRating)
exports.getBestRateThings = (req, res, next) => {
	Book.find()
		.then(books => {
			// Trier les livres par `averageRating` en ordre décroissant
			books.sort((a, b) => b.averageRating - a.averageRating)

			// Prendre seulement les 3 premiers livres
			const bestBooks = books.slice(0, 3)

			// Retourner les meilleurs livres en JSON
			res.status(200).json(bestBooks)
		})
		.catch(error => {
			// Si une erreur se produit, la renvoyer
			res.status(400).json({ error })
		})
}

// Modify one book
exports.modifyOneThing = (req, res, next) => {
	const thingObject = req.file ? {
		...JSON.parse(req.body.book),
		imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
	} : { ...req.body }

	delete thingObject._userId
	delete thingObject._id

	Book.findOne({ _id: req.params.id })
		.then(thing => {
			if (thing.userId != req.auth.userId) {
				return res.status(401).json({ message: 'Non-autorisé' })
			} else {
				// Supprimer l'ancienne image si une nouvelle image a été envoyée
				if (req.file && thing.imageUrl) {
					const oldImage = thing.imageUrl.split('/images/')[1]
					fs.unlink(`images/${oldImage}`, (err) => {
						if (err) {
							console.log('Erreur lors de la suppression de l\'ancienne image:', err)
						}
					})
				}
				Book.updateOne({ _id: req.params.id }, { ...thingObject, _id: req.params.id })
					.then(() => res.status(200).json({ message: 'Objet modifié !' }))
					.catch(error => res.status(400).json({ error }))
			}
		})
		.catch(error => res.status(400).json({ error }))
}

exports.deleteOneThing = (req, res, next) => {
	Book.findOne({ _id: req.params.id })
		.then(thing => {
			if (thing.userId != req.auth.userId) {
				return res.status(401).json({ message: 'Non-autorisé' })
			} else {
				// Supprimer l'image associée
				if (thing.imageUrl) {
					const filename = thing.imageUrl.split('/images/')[1]
					fs.unlink(`images/${filename}`, () => {
						Book.deleteOne({ _id: req.params.id })
							.then(() => res.status(200).json({ message: 'Objet supprimé !' }))
							.catch(error => res.status(400).json({ error }))
					})
				} else {
					Book.deleteOne({ _id: req.params.id })
						.then(() => res.status(200).json({ message: 'Objet supprimé !' }))
						.catch(error => res.status(400).json({ error }))
				}
			}
		})
		.catch(error => res.status(500).json({ error }))
}