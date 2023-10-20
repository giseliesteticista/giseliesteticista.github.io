import { NextApiRequest, NextApiResponse } from "next";
import connectDB from "@/middleware/mongodb";
import Agenda from '@/models/Appointment';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if(req.method == 'GET') {

            const appointments = await Agenda.find({});

            const data = await appointments.map((agenda) => {
                return {
                    "id": agenda._id,
                    "name": agenda.name,
                    "phone": agenda.phone,
                    "service": agenda.service,
                    "date": agenda.date,
                    "hour": agenda.hour,
                    "ending": agenda.ending,
                    "createdAt": agenda.createdAt,
                    "expireAt": agenda.expireAt
                }
            });
    
            res.status(201).json({
                success: true,
                data: data
            });

        } else {
            res.status(400).json({
                success: false,
                message: `O método utilizado não é suportado. Confira a documentação.`
            });
        }
    } catch(error) {
        console.log('[DEBUG]:', error);
        res.status(500).json({
            success: false,
            message: error
        });
    }
}

export default connectDB(handler);