import express from 'express';
import cookieParser from 'cookie-parser';
import router from './routes/index.js';
import requestLogger from './utils/requestLogger.js';
import cookieMonster from './utils/cookieMonster.js';

const app = express();

/* basic express config */
app.use(express.json({limit: "100mb"}));
app.use(cookieParser());

/* custom middlewares */
app.use(cookieMonster);
app.use(requestLogger);

/* main router */
app.use('/', router);

/* 404 Not Found handler */
app.use('*', (req, res) => res.status(404).json({
    status: "error",
    message: "endpoint not found",
}));

export default app;
