const express = require('express')
const app = express()
const mongoose = require('mongoose')
const path = require('path')
const booksRoutes = require('./routes/books')
const userRoutes = require('./routes/user')

mongoose.connect('mongodb://noamguez0:eN7pZunQKuzrMmyvPJ@monvieuxgrimoire-shard-00-00.8vqjo.mongodb.net:27017,monvieuxgrimoire-shard-00-01.8vqjo.mongodb.net:27017,monvieuxgrimoire-shard-00-02.8vqjo.mongodb.net:27017/?replicaSet=atlas-ae8na6-shard-0&ssl=true&authSource=admin&retryWrites=true&w=majority&appName=MonVieuxGrimoire')
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(error => console.log('Connexion à MongoDB échouée...', error))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*') // Ou l'adresse spécifique de votre front
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS') // Ajout des méthodes autorisées
    next();
})

app.use(express.json())
app.use('/api/books', booksRoutes)
app.use('/api/auth', userRoutes)
app.use('/images', express.static(path.join(__dirname, 'images')))

module.exports = app