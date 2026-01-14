let apiUrl;
let staticApiUrl;

const salmonEnv = process.env.REACT_APP_SALMON_ENV ?? process.env.NODE_ENV;

switch (salmonEnv) {
  case 'production':
    staticApiUrl = 'https://d1fh2pwo7kzely.cloudfront.net';
    apiUrl = 'https://surtbtej2d.execute-api.us-east-1.amazonaws.com/prod';
    break;
  case 'development':
    staticApiUrl = 'https://d1fh2pwo7kzely.cloudfront.net';
    apiUrl = 'https://d1ms6b491qeh6d.cloudfront.net';
    break;
  case 'test':
  case 'local':
    staticApiUrl = 'http://localhost:3000/local';
    apiUrl = 'http://localhost:3000/local';
    break;
  case 'main':
    staticApiUrl = 'https://d1fh2pwo7kzely.cloudfront.net';
    apiUrl = 'https://bo0q5g7ie1.execute-api.us-east-1.amazonaws.com/main';
    break;
}
module.exports = { SALMON_API_URL: apiUrl, SALMON_STATIC_API_URL: staticApiUrl };
