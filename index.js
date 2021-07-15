const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");

const PORT = process.env.COUNTER_PORT || 3001;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

let array = [];

fs.stat("./counter/counter.log", (err, stats) => {
  !stats &&
    fs.appendFile("./counter/counter.log", "", (err) => {
      if (err) throw err;
    });
  if (err) throw err;
});

fs.readFile("./counter/counter.log", "utf8", (err, data) => {
  if (err) throw err;
  let dataSplit = data.split(":");
  let trash = dataSplit.pop();
  dataSplit.forEach((el) => {
    let elSplit = el.split(".");
    const book = {
      id: elSplit[0],
      count: elSplit[1],
    };
    array.push(book);
  });
});

app.get("/array", (req, res) => {
  res.json(array);
});

app.get("/counter/:bookID", (req, res) => {
  const { bookID } = req.params;
  const idx = array.findIndex((el) => el.id === bookID);
  idx !== -1
    ? res.json(array[idx].count)
    : res.status(404).json("ФАЙЛ НЕ НАЙДЕН");
});

app.post("/counter/:bookID", (req, res) => {
  const { bookID } = req.params;
  const idx = array.findIndex((el) => el.id === bookID);
  if (idx !== -1) {
    array[idx].count++;
    let file = fs.createWriteStream("counter/counter.log");
    array.forEach((el) =>
      file.write(`${el.id}.${el.count}:`, (err) => {
        if (err) throw err;
      })
    );
    res.json(true);
  } else {
    const book = {
      id: bookID,
      count: 1,
    };
    array.push(book);
    fs.appendFile(
      __dirname + "/counter/counter.log",
      `${book.id}.${book.count}:`,
      (err) => {
        if (err) throw err;
      }
    );
    res.json(true);
  }
});

app.listen(PORT, () => {
  console.log("counter listen port " + PORT);
});
