var noflo = require('noflo');

/**
 * Adds two numbers
 * @param {String} text_to_encrypt
 * @param {Number} shift - number of letters to shift by
 * @return {String} encrypted text
 */

function ArgumentException(message) {
   this.message = message;
   this.name = 'ArgumentException';
}

var encryptCaesar = function(text_to_encrypt, shift) {
	// build a mapping from plain to cipher char
    // Only doing lower case for simplicity
  	var cipher_map = {};
  	var letters = 'abcdefghijklmnopqrstuvwxyz';
  	var n_chars = letters.length;
  	
  	for (var i = 0; i < n_chars; i++) {
     	var cipher = letters.charAt(i);
      	var plain = letters.charAt((i+shift) % n_chars);
      	cipher_map[plain] = cipher;
    }
  	
    var plain_text = text_to_encrypt.toLowerCase();
  	var encrypted_chars = [];
  	var n_text = plain_text.length;
  	for (var j = 0; j < n_text; j++) {
       	var ch_plain = plain_text.charAt(j);
     	var ch_encrypted = cipher_map[ch_plain];
      	if (ch_encrypted) {
      		encrypted_chars.push(ch_encrypted);
        } else {
         	encrypted_chars.push(ch_plain); 
        }
    }
  	var encrypted_text = encrypted_chars.join("");
  	return encrypted_text;
};

exports.getComponent = function() {
  // As per Caeser Cipher spec shifting by 3
  var c = new noflo.Component();
  c.description = 'Encrypts data using Caesar Cipher';
  c.icon = 'forward';
  
  c.inPorts.add('input_text', {
    datatype: 'string',
    description: 'Input string to process'
  });
  
  c.inPorts.add('shift', {
    datatype: 'int',
    description: 'Shift'
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
      	if (!input_text || !shift) {
         	throw new ArgumentException(
              "Invalid input data: " + 
              JSON.stringify(node_inputs)); 
        }
      
      	if (!Number.isInteger(shift) || shift <= 0) {
         	throw new ArgumentException(
              "Shift parameter must be a positive integer");
        }
      	
        var input_json = JSON.parse(input_text);
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