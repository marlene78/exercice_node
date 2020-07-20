const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const User = require('../models/userModel');

/**
 * Register user and password hash
 * @param {*} req 
 * @param {*} res 
 */
exports.user_register = (req, res) => {
  let new_user = new User(req.body);
  //password hash 
   bcrypt.hash(new_user.password, saltRounds, function(err, hash) { 
    new_user.password = hash
    new_user.save()
    .then(user => {    
        res.status(201);
        res.json(user);       
    })
    .catch(error => {
      res.status(500);
      console.log(error);
      res.json({message: "Erreur serveur."})
    })
  });
}


/**
 * Login 
 * @param {*} req 
 * @param {*} res 
 */
exports.user_login = (req, res) => {
  let {body} = req;
  // let body = req.body
  User.findOne({email: body.email})
  .then(user => {
    
    //comparaison password
    bcrypt.compare( body.password, user.password, function(err, result) {
    
      if(result === true){
        let userData = {
          email: user.email
        }
        jwt.sign({userData}, process.env.JWT_KEY, {expiresIn: '30 days'}, (error, token) => {
          if(error){
            res.status(500);
            console.log(error);
            res.json({message: "Token invalide"});
          }
          else {
            res.json({token , "role" : user.isAdmin});
          }
        })
      }
      else{
        res.status(500);
        res.json({message: "Mot de passe incorrect"})
      }
    });

  

  })
  .catch(error => {
    res.status(500);
    console.log(error);
    res.json({message: "Compte invalide"})
  })
}
