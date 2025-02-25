const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();
const Person = require("./modules/person");

const app = express();

app.use(express.static("dist"));
app.use(cors());
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

const errorHandler = (error, request, response, next) => {
  console.log(error.message);
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

const urlBase = "/api/persons";
const PORT = process.env.PORT;

const unknowEndpoint = (request, response) => {
  response.status(404).send({ error: "unknow endpoint" });
};

app.get("/", (request, response) => {
  response.send("<h1>Hello world</h1>");
});

app.get("/info", (request, response) => {
  const date = new Date();

  Person.countDocuments({})
    .then((count) => {
      const html = `
        <p>Phonebook has info for ${count} people</p>
        <p>${date}</p>
      `;
      response.send(html);
    })
    .catch((error) => {
      console.log("Error counting documents:", error.message);
      response.status(500).send("Error retrieving data");
    });
});

app.get(urlBase, (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get(`${urlBase}/:id`, (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.json(404).end();
      }
    })
    .catch((error) => next(error));
});

app.post(urlBase, (request, response, next) => {
  const body = request.body;

  if (!body) {
    return response.status(400).json({ error: "Content missing" });
  }

  if (body.name === "" || body.number === "") {
    return response
      .status(400)
      .json({ error: "The name and/or number field is missing" });
  }

  Person.findOne({ name: body.name })
    .then((existPerson) => {
      if (existPerson)
        return response.status(400).json({ error: "name must be unique" });
      const person = new Person({
        name: body.name,
        number: body.number,
      });

      person.save().then((savedPerson) => {
        response.json(savedPerson);
      });
    })
    .catch((error) => next(error));
});

app.put(`${urlBase}/:id`, (request, response, next) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response
      .status(400)
      .json({ error: "The name and/or number field is missing" });
  }

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => {
      next(error);
    });
});

app.delete(`${urlBase}/:id`, (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.use(unknowEndpoint);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
