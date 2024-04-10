import assert from 'assert';
import request from 'supertest';
import app from '../app.js';

setTimeout(() => {
    console.log('Running Tic Tac Toe Server tests');

    // GET / test
    console.log('Testing GET /');
    request(app)
      .get('/')
      .expect(200)
      .expect('GET request to the homepage', () => {
        console.log('GET / test passed');
    });

}, 0);