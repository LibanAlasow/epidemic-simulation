const express = require('express');
const path = require('path');  // Import the 'path' module
const { uniqueNamesGenerator, names, countries, animals } = require('unique-names-generator');

const config = {
  dictionaries: [names]
}
const config2 = {
  dictionaries: [countries]
}


const app = express();
const port = 3000;
const year = new Date().getFullYear();

function formatDate(existingDate) {
  const year = existingDate.getFullYear();
  const month = String(existingDate.getMonth() + 1).padStart(2, '0'); // Add 1, pad with '0'
  const day = String(existingDate.getDate()).padStart(2, '0'); // Pad with '0'
  const formattedDate = `${year}-${month}-${day}`;

  return formattedDate
}

class Planet {
  constructor(name, population) {
    this.name = name
    this.population = population
  }

  FormatPeopleHTML() {
    var html = ``
    for (var i = 0; i < 20; i++) {
      let person = this.population[Object.keys(this.population)[i]]
      html += `
      <div class="person">
        <div class="pfp"></div>
        <p class="name">(${person.gender}) ${person.first_name} ${person.last_name} <span class="age">${formatDate(person.birthdate)}</span></p>
        <p class="country">${person.homeland}</p>
        <p class="status"><span class="bold">Status </span> ${person.infection_status}</p>
      
      </div>
      `
    }
    return html
  }
}

class Person {
  constructor(first_name, last_name, age,homeland,gender) {
    this.first_name = first_name;
    this.last_name = last_name;
    this.homeland = homeland;
    this.gender = gender

    if (homeland == "Israel") {
      this.homeland = "Palestine"
    }

    this.infection_status = "Healthy";
    this.birthdate =  new Date(new Date().setFullYear(new Date().getFullYear() - age));
    this.id = String("#")+(Math.floor(Math.random() * 100000000));
  }

  infect() {
    this.infection_status = "Infected";
  }

  cure() {
    this.infection_status = "Recovered";
  }

  kill() {
    this.infection_status = "Killed"
  }

  Die() {
    this.infection_status = "Dead"
  }
  
}


const Earth = new Planet("Earth", {})

for (let i=0; i<1000; i++) {
  let gender = Math.random() < 0.5 ? "M" : "F";
  let adam = new Person(uniqueNamesGenerator(config), uniqueNamesGenerator(config), Math.floor(Math.random() * 40), uniqueNamesGenerator(config2), gender)
  Earth.population[adam.id] = adam
}


  
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});