const express = require("express");
const morgan = require("morgan");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

morgan.token("body", (req) => JSON.stringify(req.body));

app.use(morgan("tiny", { skip: (req) => req.method === "POST" }));

app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :body",
    {
      skip: (req) => req.method !== "POST",
    }
  )
);

const urlBase = "/api/persons";
const PORT = 3000;

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const generateId = () => {
  return Math.floor(Math.random() * (9999999 - 1) + 1);
};

app.get("/", (request, response) => {
  response.send("<h1>Hello world</h1>");
});

app.get("/info", (request, response) => {
  const date = new Date();
  const html = `
  <p>Phonebook has info for ${persons.length} people</p>
  <p>${date}</p>
  `;
  response.send(html);
});

app.get(urlBase, (request, response) => {
  response.json(persons);
});

app.get(`${urlBase}/:id`, (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.post(urlBase, (request, response) => {
  const body = request.body;

  if (!body) {
    return response.status(400).json({ error: "Content missing" });
  }

  if (body.name === "" || body.number === "") {
    return response
      .status(400)
      .json({ error: "The name and/or number field is missing" });
  }

  const existPerson = persons.find((person) => person.name === body.name);

  if (existPerson) {
    return response.status(400).json({ error: "name must be unique" });
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  };

  persons = persons.concat(person);

  response.json(person);
});

app.delete(`${urlBase}/:id`, (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);
  response.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
