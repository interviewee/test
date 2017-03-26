var noflo = require('noflo');

/**
 * Exception thrown for invalid arguments
 * 
 * @constructor
 * @param {String} message - Exception message
 * @return {String} encrypted text
 */

function ArgumentException(message) {
   this.message = message;
   this.name = 'ArgumentException';
}


/**
 * Encrypts a plain text string using Caesar Cipher with 
 * specified shift
 *
 * @param {String} text_to_encrypt - plain text
 * @param {Number} shift - number of letters to shift by
 * @return {String} encrypted text
 */

var encryptCaesar = function(text_to_encrypt, shift) {
	// build a mapping from plain to cipher letters
    // Only doing lower case for simplicity
  
  	var cipher_map = {};
  	var letters = 'abcdefghijklmnopqrstuvwxyz';
  	var len_chars = letters.length;
  	
  	for (var i = 0; i < len_chars; i++) {
        // Right shifting as per wikipedia 
        // Caeser Cipher explanation:
      	// https://en.wikipedia.org/wiki/Caesar_cipher
     	var cipher = letters.charAt(i);
      	var plain = letters.charAt((i+shift) % len_chars);
      	cipher_map[plain] = cipher;
    }
  	
  	// Encrypt lowercase version of the plain text
    var plain_text = text_to_encrypt.toLowerCase();
  	var encrypted_chars = [];
  	var len_text = plain_text.length;
  	for (var j = 0; j < len_text; j++) {
       	var ch_plain = plain_text.charAt(j);
     	var ch_encrypted = cipher_map[ch_plain];
      	// Encrypting only letters in the alphabet,
        // but keep the other characters unchanged
      	if (ch_encrypted) {
      		encrypted_chars.push(ch_encrypted);
        } else {
         	encrypted_chars.push(ch_plain); 
        }
    }
  	return encrypted_chars.join("");
};

exports.getComponent = function() {
  var c = new noflo.Component();
  c.description = 'Encrypts data using Caesar Cipher';
  c.icon = 'forward';
  
  c.inPorts.add('input_text', {
    datatype: 'string',
    description: 'Input text to process'
  });
  
  c.inPorts.add('shift', {
    datatype: 'int',
    description: 'Shift parameter for Caesar Cipher'
  });
  
  c.outPorts.add('out', {
    datatype: 'string'
  });
  
  noflo.helpers.WirePattern(c, {
    "in": ['input_text', 'shift'],
    out: 'out',
    forwardGroups: true,
    async: true
  }, function(node_inputs, groups, out, callback) {
    var result;
    try {
      	// parse the input data
      	var input_text = node_inputs.input_text;
      	var shift = node_inputs.shift;
      	
        // Validate shift param      
      	if (!Number.isInteger(shift) || shift <= 0) {
         	throw new ArgumentException(
              "Shift parameter must be a positive integer");
        }
      	
        var input_json = JSON.parse(input_text);
      
        // Validate input data
        if (!input_json.id || !input_json.data) {
         	throw new ArgumentException(
              "Invalid input data: " + input_text); 
        }
      
        var encrypted = encryptCaesar(input_json.data, shift);
        result = {"id": input_json.id, 
                      "data": encrypted, "encrypted": true};
    } catch(err) {
      	// communicate the error
     	result = {"error": err.message, "encrypted": false};
    }
    out.send(JSON.stringify(result));
    // tell WirePattern we are done
    return callback();
  });
  return c;
};