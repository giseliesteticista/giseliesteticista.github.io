import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/middleware/mongodb';
import Agenda from '@/models/Appointment';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if(req.method == 'DELETE') {

            const { id } = req.query;

            const appointmentExists = await Agenda.findById(id);

            if(!appointmentExists) return res.status(404).json({
                success: false,
                message: 'Não existe um agendamento ou já foi excluído.'
            });

            await Agenda.deleteOne({  _id: id });

            res.status(201).json({
                success: true,
                message: `O agendamento de ${appointmentExists.name} foi cancelado com sucesso!`
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