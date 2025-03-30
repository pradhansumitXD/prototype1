const path = require('path');

const uploadsConfig = {
  path: path.join(__dirname, '../../../uploads'),
  url: '/uploads'
};

module.exports = uploadsConfig;