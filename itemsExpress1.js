const mysql = require('mysql');
const express = require('express');
const { response, request } = require('express');
const app = express();
const port = 3000;
// const bodyParser 
const bodyParser = require('body-parser');

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

app.get('/api/course', (request, response) => {
  connection.query('select itemId, title, description from items', (err, rows, fields) => {
    if(!err) {
      response.send(rows);
    }
    else {
      console.log(err);
      response.send('Unable to connect');
    }
  });
});

app.post('/api/syllabus', (request, response) => {
  response.writeHead(201, {'Content-Type': 'application/JSON'});
  let title = request.query.title;
  let description = request.query.description;
  let sql = 'insert into items(title, description, status) values(?, ?, ?)';
  connection.query(mysql.format(sql, [title, description, 1]), (err, result) => {
    if(err) throw err;
    response.status(201);
    response.send("Inserted Successfully!");
    response.end();
  });
});

app.get('/api/syllabus/:pk/', (request, response) => {
  let sql = 'select * from items where itemId = ?';
  connection.query(mysql.format(sql, [request.params.pk]), (err, rows, fields) => {
    if(!err) {
      response.send(rows);
    }
    else {
      response.status(404);
    }
  });
});

app.delete('/api/syllabus/:pk', (request, response) => {
  const id = request.params.id;
  let sqlQuery = `select itemId from items where itemId = ${id}`;
  connection.query(sqlQuery, (error, result) => {
    if(result.length != 0) {
      connection.query(`update items set status = 0 where itemId = ${id}`, (error, result) => {
        if(error) throw error;
        response.status(204).send(result);
      });
    }
    else {
      response.status(404).send(result);
    }
  });
});
  

app.put('/api/syllabus/:pk', (request, response) => {
  var title = request.body.title;
  var description = request.body.description;
  var id = request.params.pk;
  const searchQuery = `select itemId from items where itemId = ${id} and status = 1`;
  connection.query(searchQuery, (error, result) => {
    if(error) throw error;
    if(result.length != 0) {
      const sqlQuery = `update items set title = ?, description = ? where itemId = ${id}`;
      const values = [title, description];
      connection.query(mysql.format(sqlQuery, values), (error, result) => {
        if(error) throw error;
        response.status(200);
        response.send(result);
      });
    }
    else {
      response.status(404).send(result);
    }
  });
})