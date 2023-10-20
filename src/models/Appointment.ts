import mongoose, { mongo } from 'mongoose';

var Schema = mongoose.Schema;

var appointment = new Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    service: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    hour: {
        type: String,
        required: true
    },
    ending: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    expireAt: {
        type: Date,
        expires: 300,
    }
});

const Agenda = mongoose.model('Agenda', appointment);

export default Agenda;

