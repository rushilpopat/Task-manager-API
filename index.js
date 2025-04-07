const express = require('express');
const mongoose = require('mongoose');
const Task = require('./model/task_schema');
const app = express();
const port =  process.env.PORT || 3000;

app.use(express.json());

const dotenv = require('dotenv');
dotenv.config();
const dbURI = process.env.MONGODB_URI;
mongoose.connect(dbURI)
  .then(() => {
    console.log('Connected to the database');
  })
  .catch((err) => {
    console.log('Failed to connect to the database', err);
  });

app.get('/tasks', (req, res) => {
  const { status, dueDate } = req.query;
  let filter = {};
  if (status) filter.status = status;
  if (dueDate) filter.dueDate = { $lte: new Date(dueDate) };
  
  Task.find(filter)
    .then((result) => {
      res.send(result);
    })
    .catch((err) => res.status(500).send(err));
});

app.get('/tasks/:id', (req, res) => {
  const id = req.params.id;
  Task.findById(id)
    .then((result) => {
      if (result) {
        res.send(result);
      } else {
        res.status(404).send({ error: 'Task not found' });
      }
    })
    .catch((err) => res.status(500).send(err));
});

app.post('/tasks', (req, res) => {
  const task = new Task(req.body);
  task.save()
    .then((result) => {
      res.status(201).send(result);
    })
    .catch((err) => res.status(400).send(err));
});

app.put('/tasks/:id', (req, res) => {
  const id = req.params.id;
  Task.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
    .then((result) => {
      if (result) {
        res.send(result);
      } else {
        res.status(404).send({ error: 'Task not found' });
      }
    })
    .catch((err) => res.status(400).send(err));
});

app.delete('/tasks/:id', (req, res) => {
  const id = req.params.id;
  Task.findByIdAndDelete(id)
    .then((result) => {
      if (result) {
        res.send(result);
      } else {
        res.status(404).send({ error: 'Task not found' });
      }
    })
    .catch((err) => res.status(500).send(err));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}/tasks`);
});