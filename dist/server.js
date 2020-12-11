var _a;
/* istanbul ignore file */
import express from 'express';
import bodyParser from 'body-parser';
import { cache, headers, fallback } from './util/middlewares';
import screenshotR from '.';
const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 6000;
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/', headers); // Check out the example middleware!
app.use('/', cache); // Check out the example middleware!
/**********************************************/
const getShot = screenshotR();
const postShot = screenshotR({ method: 'post' });
app.get('/', getShot);
app.get('/:filename', getShot);
app.post('/', postShot);
/**********************************************/
app.use(fallback);
app.listen(PORT, () => console.log(`App listening on port ${PORT}`));
//# sourceMappingURL=server.js.map