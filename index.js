require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log("Підключено до MongoDB"))
  .catch((err) => console.error("Помилка підключення:", err));

const noteSchema = new mongoose.Schema({
  text: String
});

const Note = mongoose.model('Note', noteSchema);

app.get('/api/notes', async (req, res) => {
  const notes = await Note.find();
  res.json(notes);
});

app.post('/api/notes', async (req, res) => {
  const newNote = await Note.create({ text: req.body.text });
  res.status(201).json(newNote);
});

app.put('/api/notes/:id', async (req, res) => {
  const updatedNote = await Note.findByIdAndUpdate(req.params.id, { text: req.body.text }, { new: true });
  res.status(200).json(updatedNote);
});

app.delete('/api/notes/:id', async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Сервер запущено на порту ${PORT}`);
});