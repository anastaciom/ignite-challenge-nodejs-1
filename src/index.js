const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const getUser = users.find((user) => user.username === username);

  if (!getUser) {
    return response.status(404).json({ error: "Usuário não encontrado." });
  }
  request.username = getUser;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  const isExists = users.find((user) => user.username === username);

  if (isExists) {
    return response.status(400).send({ error: "usuário já existe." });
  }

  users.push(newUser);
  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request;

  return response.json(username.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(), // precisa ser um uuid
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  username.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const findById = username.todos.find((todo) => todo.id === id);

  if (!findById) {
    return response.status(404).json({ error: "Todo não existe" });
  }

  findById.title = title;
  findById.deadline = new Date(deadline);

  return response.json(findById);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const findById = username.todos.find((todo) => todo.id === id);

  if (!findById) {
    return response.status(404).json({ error: "Todo não existe" });
  }

  findById.done = true;

  return response.json(findById);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const findById = username.todos.findIndex((todo) => todo.id === id);

  if (findById === -1) {
    return response.status(404).json({ error: "Todo não encontrado" });
  }

  username.todos.splice(findById, 1);

  return response.status(204).json();
});

module.exports = app;
