const express = require('express');
const knex = require('knex');
const bcrypt = require('bcrypt-nodejs');

// init database
const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'smartbrain',
        password: 'smartbrain',
        database: 'smartbraindb'
    }
});

// console.log(db.select('*').from('users')); ------- CONNECTED

// router
const router = express.Router();

/*********************
******* ROUTES *******
*********************/

// get --> user/profile/:id ===> fetchs the user profile
router.get('/profile/:id', (req, res) => {
  const id = parseInt(req.params.id);
  db('users').select('*').where('id', '=', id)
    .then(profile => {
      profile.length ? res.json(profile[0]) : res.status(400).json({ message: 'profile not found' });
    })
    .catch(error => res.status(400).json({ message: 'something went wrong' }));
});

// post --> user/signin ===> for signin page
router.post('/signin', (req, res) => {
  const { email, password } = req.body;
  db('users').select('email', 'hash').from('login').where('email', '=', email)
    .then(data => {
      data.length
      ? bcrypt.compareSync(password, data[0].hash)
        ? db('users').select('*').where('email', '=', email)
          .then(profileData => res.json({
            message: 'Success',
            userProfile: profileData[0]
          }))
          .catch(error => res.status(400).json({ message: 'failed to get userprofile'}))
        : res.status(401).json({ message: 'unauthorized' })
      : res.status(400).json({ message: 'failed to get userprofile'})
    })
    .catch(error => res.status(400).json({ message: 'failed to get userprofile'}))
})

// post --> user/register ==> for register page
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  const hash = bcrypt.hashSync(password);

  if (!name || !email || !password) {
    return res.status(400).json({ 
      message: 'please enter a valid email, username and a password to register'
    });
  } else {
    db.transaction(trx => {
      trx.insert( {hash: hash,email: email} )
      .into('login')
      .returning('email')
      .then(loginEmail => {
        return db('users').returning('*').insert({
          name: name,
          email: loginEmail[0],
          joined: new Date()
        }).then(data => res.json(data[0]))
      })
      .then(trx.commit)
      .catch(trx.rollback)
    })
    .catch(error => res.status(400).json({
      message: 'can not register, make sure to enter valid email username and password.'
    }));
  }
});

// put --> user/entries ==> for updating the user entries
router.put('/entries', (req, res) => {
  const { id } = req.body;
  db('users').where('id', '=', id).increment('entries', 1)
    .returning('entries')
    .then(data => {
      data.length ? res.json({ entries: parseInt(data[0]) }) : res.status(400).json({ message: 'something went wrong getting entries'})
    })
    .catch(error => res.status(400).json({ message: 'something went wrong getting entries'}));
});


// export router
module.exports = router;