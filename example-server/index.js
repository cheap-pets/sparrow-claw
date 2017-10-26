const { HttpService } = require('henhouse');
const { resolve } = require('path');

const httpService = new HttpService();
httpService
  .static({ root: resolve(__dirname, '..', 'examples') })
  .static('/dist')
  .listen(3000);
console.log('listening on port 3000.');