import {http_server} from './app';
import config from 'config';

let port = process.env.PORT || config.get('server.port');

const server = http_server.listen(port, () => {
    console.log('Express server listening on port ' + port);
});

