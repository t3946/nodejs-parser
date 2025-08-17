import {App} from "./App"


import express from 'express';

const app = express();
const port = 3000;

app.use(express.json());

// Получить список ресурсов
app.get('/', (req, res) => {
    // App.main()
    res.send('Hello World3!');
});

app.listen(port, () => {
    console.log(`REST API сервер запущен на порту ${port}`);
});
