const User = require("../models/User");
const fs = require("fs");
const path = require("path");
const { exists } = require("../models/User");
// importar libreria bcrypt
const bcrypt = require('bcrypt-nodejs');
// importar jwt
const jwt = require('../jwt/jwt');

const userController = {

  createUser: (req, res) => {
    console.log("la req ", req.body);
    const user = new User();

    // Asignar valores al objeto
    user.usuario = req.body.usuario;
    user.email = req.body.email;
    user.rol = req.body.rol;
 // comprobar email unico         // se usa userID para no tener conflicto con user
 console.log('userr',user)
 User.findOne({email: user.email.toLowerCase()}, ((err, userId) =>{
  if(err){
      res.status(500).send({message: 'error al comprobar el usuario'});
  }else{
      if(!userId){
            // codificar password
          bcrypt.hash(req.body.password, null, null, function (err, hash) {
              user.password = hash
              // guardar usuario
              user.save((err, userStored) => {
                  if(err){
                      res.status(500).send({message: 'error al guardar el usuario'});
                  }else{
                      if(!userStored){
                          res.status(404).send({message: 'No se ha registrado el usuario'});
                      }else{
                          res.status(200).send({user: userStored, message: 'usuario guardado correctamente'});
                          }
                      }

                })

               })
          }else{
              res.status(500).send({message: 'el email del usuario ya existe'});
          }
      }
  }))



},
login: (req, res) => {
  const params = req.body
  const password = params.password
  const email = params.email
          // comprobar si el email existe
          User.findOne({email: email.toLowerCase()}, (err, user) =>{
              if(err){
                  res.status(500).send({message: 'error al comprobar el usuario'});
              }else{
                  if(user){
                      // comprobar password enviado con el existente
                      bcrypt.compare(password , user.password, (err, check) => {

                      if(check){
                              // comprobar y generar token
                          if(params.gettoken){
                               // devolver token
                               res.status(200).send({
                                   token: jwt.createToken(user)
                               });
                          }else{
                              res.status(200).send({user: user});
                          }

                      }else{
                          res.status(404).send({ message: 'el password no es correcto'});
                      }

                      })

                  }else{
                      res.status(404).send({ message: 'el usuario no esta registrado'});
                  }
              }
          })

} ,
  getUser: (req, res) => {
    User.find((err, user) =>
      err ? res.status(500).send("error") : res.status(200).jsonp(user)
    );
  },

  getUserID: (req, res) => {
    User.findById(req.params.id, (err, user) =>
      err ? res.status(500).send("error") : res.status(200).jsonp(user)
    );
  },
  getDelete: (req, res) => {
    User.findByIdAndDelete({ _id: req.params.id }, (err, user) =>
      err
        ? res.status(500).send("error")
        : res.status(200).send("borrado correctamente")
    );
  },

  getUpdate: (req, res) => {

    // recoger parametros
    const userId = req.params.id
    const update = req.body
    delete update.password
   // console.log('id', userId, 'update', update)
   // comprobar id usuario logeado y el que viene ne los params
   if(userId != req.user.sub){
     return res.status(500).send({ message: 'no tienes permisos'});
 }
User.findByIdAndUpdate(userId, update, {new:true}, (err, userUpdated) => {
     if(err){
         res.status(500).send({ message: 'error al actuaqlizar usuario'});
     }else{
        if(!userUpdated){
         res.status(404).send({ message: 'no se ha podido actuaqlizar usuario'});
        }else{
          res.status(200).send({user: userUpdated})
        }

     }
})
 },
  getImagen: (req, res) => {
   const file = req.params.image;
   console.log('nombre imagen', file);
   const path_file = 'src/assets/images/upload_user/' + file;

   fs.exists(path_file, (exists) =>{
     console.log('EXISTS', path.resolve(path_file));
     if (exists) {
       res.sendFile(path.resolve(path_file));
     } else {
      res.status(404).send("La imagen no existe")
     }
   })

  },

  upload: (req, res) => {
    const user = new User();
    console.log("esto es req", req.files);
    if (!req.files) {
      return res.status(404).send("No se a subido ninguna imagen");
    }
    const file_path = req.files.file0.path;
    const file_split = file_path.split("\\");
    const file_name = file_split[4];
    const extension_split = file_name.split(".");
    const file_ext = extension_split[1];
    console.log("filenamee", file_name);
    if (file_ext != "jpg" && file_ext != "png") {
      fs.unlink(file_path, (err) => {
        return res.status(200).send("Solo se permite jpg y png");
      });
    } else {
      const imagenId = req.params.id;
      console.log("imgid  file name", imagenId, file_name);
      if (imagenId) {
        User.findByIdAndUpdate(
          { _id: imagenId },
          { imagen: file_name },
          { new: true },
          (err, userUpload) => {
            if (err || !userUpload) {
              return res.status(200).send("Error al guardar la imagen");
            }
            return res.status(200).send({
              user: userUpload,
            });
          }
        );
      } else {
        return res.status(200).send({
          imagen: file_name,
        });
      }
    }
  },



  getSearch: (req, res) => {
    const busqueda = req.params.search;
    console.log(busqueda);
    User.find({
      $or: [
        { usuario: { $regex: busqueda, $options: "i" } },
        { email: { $regex: busqueda, $options: "i" } },
        { rol: { $regex: busqueda, $options: "i" } },
      ],
    })
      .sort([["descending"]])
      .exec((err, users) => {
        if (err) {
          return res.status(500).send("erroraco");
        }
        if (!users || users.length <= 0) {
             return res.status(404).jsonp({message: 'No hay resultados de la busqueda'})

         // return res.status(200).jsonp(users);
        }
        return res.status(200).jsonp(users);
      });
  },
};

module.exports = userController;
