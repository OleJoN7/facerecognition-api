const express = require('express');
const bodyParser = require('body-parser');
const Clarifai = require('clarifai');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const appClarifai = new Clarifai.App({
    apiKey: '19506945e5354c0f9d06fdc357117e91'
});

const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'oleg',
      password : 'oleg',
      database : 'face-recognition'
    }
});


const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/',(req,res) => {
    res.send('it is working')
})

app.post('/signin',(req,res) => {
  const { email, password } = req.body
  if(!email || !password) {
      return res.status(400).json('incorrect form submission')
  }
  db.select('email','hash').from('login')
  .where('email','=',email)
  .then(data => {
    const isValid = bcrypt.compareSync(password, data[0].hash);
    if(isValid) {
       return db.select('*').from('users')
        .where('email','=',email)
        .then(user => res.json(user[0]))
        .catch(err => res.status(400).json('unable to get user'))
    } else {
       res.status(400).json('wrong credentials')
    }
  })
  .catch(err => res.status(400).json('wrong credentials'))
})

app.post('/register',(req,res) => {
    const {email,name,password} = req.body;
    if(!email || !name || !password) {
        return res.status(400).json('incorrect form submission')
    }
    const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
        trx.insert({
            hash,
            email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
           return trx('users')
            .returning('*')
            .insert({
                email:loginEmail[0],
                name,
                joined: new Date()
            })
            .then(user => {
                res.json(user[0])
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('Unable to register'))
   
})

app.get('/profile/:id',(req,res) => {
    const { id } =req.params;
    db.select('*').from('users').where({
        id
    })
    .then(user => {
        if(user.length) {
            res.json(user[0])
        } else {
            res.status(400).json('Not found')
        }     
    })
    .catch(err =>  res.status(400).json('error getting user'))
})

app.put('/image',(req,res) => {
    const { id } = req.body;
    db('users').where('id', '=', id)
    .increment('entries',1)
    .returning('entries')
    .then(entries =>res.json(entries[0]))
    .catch(err => res.status(400).json('Unable to get entries'))
})

app.post('/imageurl',(req,res) => {
    appClarifai.models.predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
    .then(data => res.json(data))
    .catch(err => res.status(400).json('Unable to work with Clarifai API'))
})

app.listen(3000, () => {
    console.log('app is running on port 3000')
})

/*
1) / --> response = this is working
2) /signin --> POST = success/fail
3) /register --> POST = return user
4) /profile/:userId --> GET = return user
5) /image --> PUT = return updated user

*/