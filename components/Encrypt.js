var noflo = require('noflo');

/**
 * Adds two numbers
 * @param {String} text_to_encrypt
 * @param {Number} shift - number of letters to shift by
 * @return {String} encrypted text
 */

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
  var c = new noflo.Component();
  c.description = 'Forwards packets and metadata in the same way it receives them';
  c.icon = 'forward';
  c.inPorts.add('in', {
    datatype: 'all',
    description: 'Packet to forward'
  });
  c.outPorts.add('out', {
    datatype: 'all'
  });
  noflo.helpers.WirePattern(c, {
    "in": ['in'],
    out: 'out',
    forwardGroups: true,
    async: true
  }, function(data, groups, out, callback) {
    // do something with data
    // send output
    var input_json = JSON.parse(data);
    // As per Caeser Cipher spec shifting by 3
    var encrypted = encryptCaesar(input_json.data, 3);
    var result = {"id": input_json.id, 
                  "data": encrypted, "encrypted": true};
    out.send(JSON.stringify(result));
    // tell WirePattern we are done
    return callback();
  });
  return c;
};