const express = require('express');
const path = require('path');
const app = express();
__path = process.cwd()
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 5000;
const { 
  qrRoute,
  pairRoute
} = require('./routes');
require('events').EventEmitter.defaultMaxListeners = 2000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


app.use('/qr', qrRoute);
app.use('/code', pairRoute);

app.get('/pair', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pair.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.get('/health', (req, res) => {
    res.json({
        status: 200,
        success: true,
        service: 'Gifted-Md Session',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`
Deployment Successful!

 Gifted-Session-Server Running on http://0.0.0.0:` + PORT)
})

module.exports = app