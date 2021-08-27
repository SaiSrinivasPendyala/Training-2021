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

function getUserId(token, callback) {
    var userId = null;
    var sql = 'select userId from users where token = ?';
    connection.query(mysql.format(sql, [token]), (error, result, fields) => {
        if(result.length == 0) {
            console.log({"Error": "Invalid token!"});
        }
        var userId = result;
        console.log(userId);
        callback(userId);
    });
}

app.get('/api/course', (request, response) => {
    const token = request.headers.authorization;
    const userId = getUserId(token, (userId) => {
        console.log(userId);
        sql = `select itemId, title, description from items where userId = ? and status = 1`;
        connection.query(mysql.format(sql, [userId[0].userId]), (error, result, fields) => {
            if(error) throw error;
            if(result.length <= 0) {
                response.status(400);
                response.send({"Error": "Data not found!"});
                response.end();
            }
            response.send(result);
        });
    });
});    
  
app.post('/api/syllabus', (request, response) => {
    const token = request.headers.authorization;
    const userId = getUserId(token, (userId) => {
        let title = request.body.title;
        let description = request.body.description;
        let sql = `insert into items(userId, title, description, status) values(?, ?, ?, ?)`;
        console.log(sql);
        connection.query(mysql.format(sql, [userId[0].userId, title, description, 1]), (error, result, fields) => {
            if(error) throw error;
            if(result.length <= 0) {
                response.status(400);
                response.send({"Error": "There are no syllabus items!"});
            }
            response.status(201);
            response.send({"Message": "Syllabus data successfully inserted!"});
        });
    });
});
  
app.get('/api/syllabus/:pk/', (request, response) => {
    const token = request.headers.authorization;
    const userId = getUserId(token, (userId) => {
        const id = request.params.pk;
        let searchQuery = `select itemId from items where itemId = ? and userId = ?`;
        connection.query(mysql.format(searchQuery, [id, userId[0].userId]), (error, result, fields) => {
            if(error) throw error;
            console.log(result.length);
            if(result.length > 0) {
                let sql = 'select itemId, title, description from items where itemId = ?';
                connection.query(mysql.format(sql, [id]), (error, result, fields) => {
                    if(error) throw error;
                    if(result.length == 0) {
                        response.status(404);
                        response.send({"Error":"Syllabus data not found!"});
                    }
                    response.status(201);
                    response.send(result);
                });
            }
        });
    });
});
  
  
app.delete('/api/syllabus/:pk', (request, response) => {
    const token = request.headers.authorization;
    const userId = getUserId(token, (userId) => {
        const id = request.params.pk;
        let sqlQuery = `select itemId from items where itemId = ? and userId = ? and status = 1`;
        connection.query(mysql.format(sqlQuery, [id, userId[0].userId]), (error, result, fields) => {
            if(error) throw error;
            if(result.length > 0) {
                let deleteQuery = `update items set status = 0 where itemId = ?`;
                connection.query(mysql.format(deleteQuery, [id]), (error, result) => {
                    if(error) throw error;
                    response.status(204).send({"Message":"Syllabus data successfully deleted!"});
                });
            }
            else {
                response.status(404);
                response.send({"Error":"Data not found!"});
            }
        });
    });
});
   

app.put('/api/syllabus/:pk', (request, response) => {
    const token = request.headers.authorization;
    const userId = getUserId(token, (userId) => {
        var title = request.body.title;
        var description = request.body.description;
        var id = request.params.pk;
        const searchQuery = `select itemId from items where itemId = ? and status = 1`;
        connection.query(mysql.format(searchQuery, [id]), (error, result) => {
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
            response.status(404).send({"Error": "Invalid Credentials"});
            }
        });
    });
});