const mysql = require('mysql');
const express = require('express');
const app = express();
const port = 3000;
// const bodyParser = require('body-parser');

app.use(express.urlencoded({extended: true}));
app.use(express.json());
const connection = mysql.createConnection({
  host: '165.22.14.77',
  user: 'b27',
  password: 'b27',
  database: 'dbSrinivas'
});
// connection.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
// });
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});

app.get('/api/syllabus', (res, req) => {
  connection.query('select itemId, title, description from items', (err, rows, fields) => {
    if(!err) {
      res.send(rows);
    }
    else {
      console.log(err);
    }
  })
});
