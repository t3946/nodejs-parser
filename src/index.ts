import {App} from "./App"


import express from 'express';

const app = express();
const port = 3000;

app.use(express.json());

// Получить список ресурсов
app.get('/', (req, res) => {
    res.sendStatus(200);
});

app.get('/test', (req, res) => {
    App.main()
    res.sendStatus(200);
})

app.listen(port, () => {
    console.log(`REST API сервер запущен на порту ${port}`);
});
