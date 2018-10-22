const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

// USER REGISTRATION
const userRegistrationTemplateSource = fs.readFileSync(path.join(__dirname, '/registration.hbs'), 'utf-8');
const userRegistrationTemplate = handlebars.compile(userRegistrationTemplateSource);


module.exports = {
  userRegistrationTemplate,
};
