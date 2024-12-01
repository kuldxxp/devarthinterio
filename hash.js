const bcrypt = require('bcrypt');
const saltRounds = 10;

const plainTextPassword = 'admin123'; // Replace this with the new plain text password

bcrypt.hash(plainTextPassword, saltRounds, function(err, hash) {
  if (err) throw err;
  console.log('Hashed Password:', hash); // This is the new hashed password to insert into MongoDB
});
A