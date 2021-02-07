const Pool = require('pg').Pool
const express = require('express')
const jwt = require('jsonwebtoken')
const app = express()
require('dotenv').config()
port = 3000

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE
})

  // FORMAT OF TOKEN
  // Authorization: Bearer <access_token>
  
  function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];
      req.token = bearerToken;
      next();
    } else {
      res.sendStatus(403);
    }
  
  }

const getUsers = (request, response) => {
    pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
        if(error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getNews = (request, response) => {
    pool.query('SELECT * FROM news ORDER BY id ASC', (error, results) => {
        if(error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

app.get('/', getUsers)

app.post('/api/news', verifyToken, (req, res) => {  
    jwt.verify(req.token, process.env.ACCESS_TOKEN_SECRET, (err, authData) => {
      if(err) {
        res.sendStatus(403);
      } else {
       getNews(req, res)
      }
    });
  });
  
  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body
    await pool
    .query("SELECT * FROM users WHERE name = $1", [username])
    .then((result) => {
        const isMatch = result.rows.find((row) => {
            row.name === username && row.password === password
        })
    })
  
    jwt.sign({username : username}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30s' }, (err, token) => {
      res.json({
        token
      });
    });
  });
  

  

app.listen(port, () => {
    console.log('Server running on port : ' + port)
})