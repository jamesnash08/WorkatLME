var secureRandom = require('secure-random');

var signingKey = secureRandom(256, {type: 'Buffer'}); // Create a highly random byte array of 256 bytes

console.log("Key: " + signingKey);

