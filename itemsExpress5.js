const { v4 : uuidv4 } = require('uuid');
const mysql = require('mysql');
const express = require('express');
const { response, request } = require('express');
const app = express();
const port = 3000;
var passwordValidator = require('password-validator');
var schema = new passwordValidator();
schema
.is().min(6)                                                                  
.has().not().spaces()                           
.has().symbols(1);
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

app.post('/api/signup', (request, response) => {
    const username = request.body.username;
    const password = request.body.password;
    const token = uuidv4();
    console.log(password);
    console.log(schema.validate(password));
    if(schema.validate(password) == false) {
        response.status(401);
        response.send({"Error": "Enter a valid password"});
    }
    else {
        const insertQuery = `insert into users values(default, ?, ?, ?)`;
        connection.query(mysql.format(insertQuery, [username, password, token]), (error, result) => {
            if(error) throw error;
            response.status(201);
            response.send({"Token": token});
        });
    }
});

app.post('/api/signin', (request, response) => {
    const username = request.body.username;
    const password = request.body.password;
    var sql = `select token from users where username = ? and password = ?`;
    const query = mysql.format(sql, [username, password]);
    console.log(query);
    connection.query(mysql.format(sql, [username, password]), (error, result, fields) => {
        if(error) throw error;
        if(result.length == 0) {
            response.status(401);
            response.send({"Error":"Please enter a valid userID and password!"});
        }
        const token = result[0].token;
        console.log(result);
        response.send({"Token": token});
    });
});

function validateToken(request, response, next) {
    const token = request.headers.authorization;
    if(token == null || token == undefined) {
        response.status(401).send({"Error": "Unauthorized!"});
    }
    else {
        request.token = token;
        next();
    }
}

function getIdFromToken(request, response, next) {
    var sql = 'select userId from users where token = ?';
    connection.query(mysql.format(sql, [request.token]), (error, result, fields) => {
        if(result.length == 0) {
            response.status(401).send({"Error":"Unauthorized!"});
        }
        else {
            request.userId = result[0].userId;
            next();
        }
    })
}

app.use(validateToken);
app.use(getIdFromToken);

app.get('/api/course', (request, response) => {
    const userId = request.userId;
    const sql = `select itemId, title, description from items where userId = ? and status = 1`;
    connection.query(mysql.format(sql, [userId]), (error, result, fields) => {
        if(error) throw error;
        response.status(200).json(result);
    });
});

app.post('/api/syllabus', (request, response) => {
    const userId = request.userId;
    const title = request.body.title;
    const description = request.body.description;
    const sql = `insert into items(userId, title, description, status) values(?, ?, ?, ?)`;
    connection.query(mysql.format(sql, [userId, title, description, 1]), (error, result, fields) => {
        if(error) throw error;
        console.log(result.length);
        if(result.length <=0) {
            response.status(400).send({"Error":"Please enter all the required fields!"});
            response.end();
        }
        response.status(201).send({"Message": "Syllabus data successfully inserted!"});
    });
});

app.get('/api/syllabus/:pk', (request, response) => {
    const userId = request.userId;
    const id = request.params.pk;
    const searchQuery = `select itemId from items where itemId = ? and userId = ?`;
    connection.query(mysql.format(searchQuery, [id, userId]), (error, result, fields) => {
        if(error) throw error;
        if(result.length == 0) {
            response.status(401);
            response.send({"Error":"Please enter correct ID!"});
            response.end();
        }
        if(result.length > 0) {
            let sql = 'select itemId, title, description from items where itemId = ?';
            connection.query(mysql.format(sql, [id]), (error, result, fields) => {
                if(error) throw error;
                if(result.length == 0) {
                    response.status(404);
                    response.send({"Error":"Syllabus data not found!"});
                }
                response.status(201);
                response.json(result);
            });
        }
    });
});

app.delete('/api/syllabus/:pk', (request, response) => {
    const token = request.headers.authorization;
    const userId = getUserId(response, token, (userId) => {
        const id = request.params.pk;
        let sqlQuery = `select itemId from items where itemId = ? and userId = ? and status = 1`;
        connection.query(mysql.format(sqlQuery, [id, userId[0].userId]), (error, result, fields) => {
            if(error) throw error;
            if(result.length > 0) {
                let deleteQuery = `update items set status = 0 where itemId = ?`;
                connection.query(mysql.format(deleteQuery, [id]), (error, result) => {
                    if(error) throw error;
                    response.status(200).send({"Message":"Syllabus data successfully deleted!"});
                });
            }
            else {
                response.status(401);
                response.send({"Error":"Please enter correct ID!"});
            }
        });
    });
});
   

app.put('/api/syllabus/:pk', (request, response) => {
    const token = request.headers.authorization;
    const userId = getUserId(response, token, (userId) => {
        var title = request.body.title;
        var description = request.body.description;
        var id = request.params.pk;
        const searchQuery = `select itemId from items where itemId = ? and status = 1 and userId = ?`;
        connection.query(mysql.format(searchQuery, [id, userId[0].userId]), (error, result) => {
            if(error) throw error;
            if(result.length > 0) {
                const sqlQuery = `update items set title = ?, description = ? where itemId = ?`;
                const values = [title, description, id];
                connection.query(mysql.format(sqlQuery, values), (error, result) => {
                    if(error) throw error;
                    response.status(200);
                    response.send({"Message":"Syllabus data successfully updated!"});
                });
            }
            else {
            response.status(401).send({"Error": "Please enter correct ID!"});
            }
        });
    });
});

