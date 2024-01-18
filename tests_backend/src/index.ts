import server from './server.js';
import logger from './utils/logger.js';
import {initDB} from './initdb.js';

import 'dotenv/config';

initDB();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => logger.info(`Server listening on http://127.0.0.1:${PORT}`));
