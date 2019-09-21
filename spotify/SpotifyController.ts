import {Request, Response} from "express";

export const uri_info = async (req: Request, res: Response): Promise<Response> => {
    try {
        return res.status(200).send({yeay: 'wohoo'});
    } catch (error) {
        console.error(error);
        return res.status(500).send({result: {message: "There was an error importing the data!"}});
    }
};

