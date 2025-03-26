const Book = require('../models/Book')
const fs = require('fs')

function isRequestValid(req) {
	let isValid = true
	let book = req.body.book ? JSON.parse(req.body.book) : req.body // Gère les 2 formats

	if (!book) {
		("Erreur: book est undefined.")
		return false
	}

	if (req.method === 'POST') {
		if (!book || !req.file) {
			isValid = false
		} else if ((!book.userId || !book.title || !book.author || !book.year || !book.genre
			|| !book.ratings || !book.averageRating) || (!parseInt(book.year) || !Array.isArray(book.ratings)
				|| !parseFloat(book.averageRating) || book.ratings.length === 0 || !parseInt(book.ratings[0].grade)
				|| parseInt(book.ratings[0].grade) > 5 || parseInt(book.ratings[0].grade) <= 0)) {
			isValid = false
		}
	} else {
		// Pour PUT : On doit recevoir soit un fichier, soit un objet `book`
		if (!book && !req.file) {
			isValid = false
		} else if (book) {
			if (!book.userId || !book.title || !book.author || !book.year || !book.genre) {
				isValid = false
			}
		}
	}

	if (!isValid && req.file) {
		fs.unlink(`images/${req.file.filename}`, () => { })
	}
	return isValid
}

// Create a new book
exports.createOneThing = (req, res, next) => {
	if (!isRequestValid(req)) {
		return res.status(400).json({ error: 'Missing or Invalid book data' })
	}
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
		.catch((error) => {
			if (req.file) {
				fs.unlink(`images/${req.file.filename}`, () => { })
			}
			res.status(400).json({ error: "Certaines données ont un format invalide" })
		})
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

	Book.findById(req.params.id)
		.then(book => {
			if (!book) return res.status(404).json({ error: 'Book not found' })

			// Vérifier si l'utilisateur a déjà voté
			const hasAlreadyRated = book.ratings.some(rating => rating.userId === req.auth.userId)
			if (hasAlreadyRated) {
				return res.status(403).json({ error: 'User has already rated this book' })
			}

			// Ajouter la nouvelle note
			book.ratings.push(newRating)
			book.averageRating = parseFloat(
				(book.ratings.reduce((sum, rating) => sum + rating.grade, 0) / book.ratings.length).toFixed(2)
			)
			book.save()
				.then(updatedBook => {
					res.status(200).json(updatedBook)
				})
				.catch(error => res.status(400).json({ error }))
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


	if (!isRequestValid(req)) {
		return res.status(400).json({ error: 'Missing book data' })
	}

	// Gérer le format des données : book en string ou directement dans req.body
	let bookData = req.body.book ? JSON.parse(req.body.book) : req.body

	const thingObject = req.file
		? { ...bookData, imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` }
		: { ...bookData }

	delete thingObject._userId
	delete thingObject._id

	Book.findOne({ _id: req.params.id })
		.then(thing => {
			if (!thing) {
				return res.status(404).json({ message: "Livre non trouvé" })
			}

			if (thing.userId !== req.auth.userId) {
				return res.status(401).json({ message: 'Non-autorisé' })
			} else {
				// Supprimer l'ancienne image si une nouvelle est uploadée
				if (req.file && thing.imageUrl) {
					const oldImage = thing.imageUrl.split('/images/')[1]
					fs.unlink(`images/${oldImage}`, () => { })
				}

				// Mettre à jour le livre
				Book.updateOne({ _id: req.params.id }, { ...thingObject, _id: req.params.id })
					.then(() => res.status(200).json({ message: 'Objet modifié !' }))
					.catch(error => res.status(400).json({ error }))
			}
		})
		.catch(error => res.status(500).json({ error }))
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