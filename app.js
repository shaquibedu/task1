
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mysql = require('mysql');
/*------------------------------------------
--------------------------------------------
parse application/json
--------------------------------------------
--------------------------------------------*/
app.use(bodyParser.json());
   
/*------------------------------------------
--------------------------------------------
Database Connection
--------------------------------------------
--------------------------------------------*/
const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root', /* MySQL User */
  password: '123456As', /* MySQL Password */
  database: 'task1' /* MySQL Database */
});
   
/*------------------------------------------
--------------------------------------------
Shows Mysql Connect
--------------------------------------------
--------------------------------------------*/
conn.connect((err) =>{
  if(err) throw err;
  console.log('Mysql Connected with App...');
});
   
/**
 * Get All Items
 *
 * @return response()
 */
app.get('/api/Application',(req, res) => {
  let sqlQuery = "SELECT * FROM Application";
  
  let query = conn.query(sqlQuery, (err, results) => {
    if(err) throw err;
    res.send(apiResponse(results));
  });
});
   
/**
 * Get Single Item
 *
 * @return response()
 */
app.get('/api/Application/:Application_id',(req, res) => {
  let sqlQuery = "SELECT * FROM Application WHERE Application_id=" + req.params.Application_id;
    
  let query = conn.query(sqlQuery, (err, results) => {
    if(err) throw err;
    res.send(apiResponse(results));
  });
});
   
/**
 * Create New Item
 *
 * @return response()
 */
app.post('/api/Application',(req, res) => {
  // let data = {Applicaton_id: req.body.Applicaton_id, User_id: req.body.User_id};
  Application_id = req.body.Application_id,
  User_id = req.body.User_id
  let sqlQuery = "INSERT INTO `Application` (Application_id, User_id) VALUES (?,?)";
  
  let query = conn.query(sqlQuery, [Application_id,User_id],(err,results) => {
    if(err) throw err;
    res.send(apiResponse(results));
  });console.log("query",query)
});
   
/**
 * API Response
 *
 * @return response()
 */
function apiResponse(results){
    return JSON.stringify({"status": 200, "error": null, "response": results});
}
app.listen(3000,() =>{
  console.log('Server started on port 3000...');
});