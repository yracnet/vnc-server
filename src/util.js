const log = (...args) => {
  console.log(...args);
};

const decodeBuffer = (buf) => {
  var returnString = "";
  for (var i = 0; i < buf.length; i++) {
    if (buf[i] >= 48 && buf[i] <= 90) {
      returnString += String.fromCharCode(buf[i]);
    } else if (buf[i] === 95) {
      returnString += String.fromCharCode(buf[i]);
    } else if (buf[i] >= 97 && buf[i] <= 122) {
      returnString += String.fromCharCode(buf[i]);
    } else {
      var charToConvert = buf[i].toString(16);
      if (charToConvert.length === 0) {
        returnString += "\\x00";
      } else if (charToConvert.length === 1) {
        returnString += "\\x0" + charToConvert;
      } else {
        returnString += "\\x" + charToConvert;
      }
    }
  }
  return returnString;
};
module.exports = {
  log,
  decodeBuffer,
};
