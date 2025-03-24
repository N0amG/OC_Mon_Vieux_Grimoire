const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Utilisation de multer avec memoryStorage
const upload = multer({ storage: multer.memoryStorage() }).single('image');

// Middleware pour convertir en webp, redimensionner et enregistrer l'image
module.exports = (req, res, next) => {
	upload(req, res, async (err) => {
		if (err || !req.file) return next(err);

		// Création du nouveau nom de fichier avec extension webp
		const filename = `${req.file.originalname.split(' ').join('_').split('.')[0]}${Date.now()}.webp`;
		const outputPath = path.join('images', filename);

		try {
			// Redimensionner et convertir l'image en webp avec une qualité de 80
			await sharp(req.file.buffer)
				.resize({ width: 800 })
				.webp({ quality: 80 })
				.toFile(outputPath);

			// Attacher le nom de fichier converti à la requête
			req.file.filename = filename;
			next();
		} catch (error) {
			next(error);
		}
	});
};