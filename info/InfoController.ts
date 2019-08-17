import {Request, Response} from 'express';

export const info = (req: Request, res: Response, next) => {
    let revision = require('child_process')
        .execSync('git rev-parse --short HEAD')
        .toString().trim();
    res.status(200).send({result: {version: revision}});
};
