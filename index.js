require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

const noteSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true, maxlength: 1000 },
});

const Note = mongoose.model('Note', noteSchema);

// Перевірка id та тексту
const validId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Невірний id' });
  }
  next();
};

const validText = (req, res, next) => {
  const text = req.body?.text;
  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Текст нотатки обовʼязковий' });
  }
  next();
};

app.get('/api/notes', async (req, res) => {
  res.json(await Note.find());
});

app.post('/api/notes', validText, async (req, res) => {
  const newNote = await Note.create({ text: req.body.text });
  res.status(201).json(newNote);
});

app.put('/api/notes/:id', validId, validText, async (req, res) => {
  const updated = await Note.findByIdAndUpdate(
    req.params.id,
    { text: req.body.text },
    { new: true, runValidators: true },
  );
  if (!updated) return res.status(404).json({ error: 'Нотатку не знайдено' });
  res.json(updated);
});

app.delete('/api/notes/:id', validId, async (req, res) => {
  const deleted = await Note.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Нотатку не знайдено' });
  res.status(204).send();
});

// Обробник помилок (Express 5 передає сюди й помилки async-обробників)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Внутрішня помилка сервера' });
});

async function start() {
  if (!MONGO_URI) {
    console.error('Не задано MONGO_URI (див. .env.example)');
    process.exit(1);
  }
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Підключено до MongoDB');
  } catch (err) {
    console.error('Помилка підключення:', err);
    process.exit(1);
  }
  app.listen(PORT, () => console.log(`Сервер запущено на порту ${PORT}`));
}

start();
