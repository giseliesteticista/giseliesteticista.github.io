import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/middleware/mongodb';
import Agenda from '@/models/Appointment';
import moment from 'moment-timezone';

type AppointmentData = {
    date: Date,
    hour: string;
    ending: string;
}

type Data = {
    name: string;
    phone: string;
    service: string;
    appointment: AppointmentData;
}

// SET DEFAULT TIMEZONE TO LOCAL TIMEZONE
moment.tz.setDefault('America/Sao_Paulo');

async function handler(req: NextApiRequest,res: NextApiResponse) {
    try {
        if(req.method == 'POST') {

            // APPOINTMENT REQUEST 
            const { name, phone, appointment, service }: Data = req.body;

            // CHECK IF AVAILABLE
            const appointmentExists = await Agenda.find({ date: appointment.date, hour: appointment.hour });

            // IF NOT AVAILABLE, SEND ERROR MESSAGE
            if(appointmentExists) return res.status(404).json({
                success: false,
                message: 'Já existe um agendamento para esse horário. Escolha outro, por favor.'
            });

            // IF AVAILABLE, SAVE APPOINTMENT DETAILS IN DATABASE
            const output = await Agenda.create({
                name: name,
                phone: phone,
                service: service,
                date: appointment.date,
                hour: appointment.hour,
                ending: appointment.ending,
                expireAt: moment(`${appointment.date} ${appointment.hour}`, 'DD/MM/YYYY HH:mm').add(30, 'minutes')
            });

            res.status(201).json({
                success: true,
                data: {
                    id: output.id,
                    name: output.name,
                    phone: output.phone,
                    service: output.service,
                    date: output.date,
                    hour: output.hour,
                    ending: output.ending,
                    createdAt: output.createdAt,
                    expireAt: output.expireAt,
                }
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