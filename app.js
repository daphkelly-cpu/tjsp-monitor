const express = require('express');
const app = express();

app.get('/health', (req, res) => res.json({ok:1}));
app.get('/', (req, res) => res.json({ok:1}));
app.post('/verificar-casos', (req, res) => res.json({status:'sucesso',casosVerificados:0}));

app.listen(8080, () => console.log('ok'));
