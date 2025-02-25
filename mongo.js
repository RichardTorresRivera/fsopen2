const mongoose = require('mongoose')

const [, , ...args] = process.argv

if (args.length > 3 || args.length === 2) {
  console.log('the number of arguments is not valid')
} else if (args.length === 0) {
  console.log('give password as argument')
} else {
  const password = args[0]
  const url = `mongodb+srv://rmtr2711:${password}@cluster0.ywds7.mongodb.net/phoneBook?retryWrites=true&w=majority&appName=Cluster0`

  mongoose.set('strictQuery', false)

  mongoose
    .connect(url)
    .then(() => {
      console.log('connected to MongoDB\n')

      const personSchema = new mongoose.Schema({
        name: String,
        number: String
      })

      const Person = mongoose.model('Person', personSchema)

      if (args.length === 1) {
        Person.find({}).then((persons) => {
          console.log('phonebook:')
          persons.forEach((person) => {
            console.log(`${person.name} ${person.number}`)
          })
          mongoose.connection.close()
        })
      } else if (args.length === 3) {
        const person = new Person({ name: args[1], number: args[2] })
        person.save().then(() => {
          console.log(`added ${person.name} number ${person.number} to phonebook`)
          mongoose.connection.close()
        })
      }
    })
    .catch((error) => {
      console.log('there was an error: ', error.message)
      process.exit(1)
    })
}
