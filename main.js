const express = require('express');
const path = require('path'); // Import the 'path' module
const { uniqueNamesGenerator, names, countries, animals } = require('unique-names-generator');
const http = require('http'); // Import http module for server creation
const { Server } = require("socket.io"); // Import Socket.IO

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
  const formattedDate = `<span class="math-inline">\{year\}\-</span>{month}-${day}`;

  return formattedDate
}
function dateMY(date) {
  date = new Date(date)

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${month}/${year}`;
}

function yearsAgo(date) {
  date = new Date(date)
  if (!(typeof date === 'object' && date instanceof Date)) {
    throw new Error("Invalid date object passed to yearsAgo");
  }

  const now = new Date();
  const years = now.getFullYear() - date.getFullYear();

  // Check if the current month and day are before the date's month and day
  // to account for dates that haven't passed their anniversary yet in the current year
  if (now.getMonth() < date.getMonth() ||
      (now.getMonth() === date.getMonth() && now.getDate() < date.getDate())) {
    return years - 1; // Haven't passed the anniversary yet, so subtract 1 year
  } else {
    return years;
  }
}

function getRandomDate(minYearsAgo = 3, maxYearsAgo = 80) {
  // Validate input
  if (minYearsAgo < 0 || maxYearsAgo < minYearsAgo) {
    throw new Error("Invalid range for years ago. minYearsAgo must be non-negative and less than or equal to maxYearsAgo.");
  }

  const now = new Date();
  const minMilliseconds = now.getTime() - (maxYearsAgo * 365.25 * 24 * 60 * 60 * 1000); // Account for leap years (average)
  const maxMilliseconds = now.getTime() - (minYearsAgo * 365.25 * 24 * 60 * 60 * 1000);

  // Generate random milliseconds within the range
  const randomMilliseconds = Math.floor(Math.random() * (maxMilliseconds - minMilliseconds)) + minMilliseconds;

  return new Date(randomMilliseconds);
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
        <div class="pfparea"><div class="pfp"></div></div>
        <p class="name"><span class="gender">(${person.gender})</span> ${person.first_name} <span class="lastname">${person.last_name}</span></p>
        <p class="age">${dateMY(Date(person.birthdate))} (${yearsAgo(Date(person.bithdate))} years old)</p>
        <p class="country">${person.homeland}</p>
        <p class="status"><span class="bold">Status </span> ${person.infection_status}</p>

      </div>
      `
    }
    return html
  }
}

class Person {
  constructor(first_name, last_name, birthdate, homeland, gender) {
    this.first_name = first_name;
    this.last_name = last_name;
    this.homeland = homeland;
    this.gender = gender

    if (homeland == "Israel") {
      this.homeland = "Palestine"
    }

    this.infection_status = "Healthy";
    this.birthdate = birthdate
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
  let adam = new Person(uniqueNamesGenerator(config), uniqueNamesGenerator(config), getRandomDate(), uniqueNamesGenerator(config2), gender)
  Earth.population[adam.id] = adam
}


// Create an HTTP server
const server = http.createServer(app);

// Create a Socket.IO instance attached to the HTTP server
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.IO connection listener
io.on('connection', (socket) => {
  console.log('A user connected');

  // Send initial earth data (population) to the connected client
  socket.emit('earthData', Earth.FormatPeopleHTML());

  // You can also emit updates to specific client events as needed
  // For example, if a person's status changes:
  // socket.emit('personStatusUpdate', { id: person.id, newStatus: person.infection_status });
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});