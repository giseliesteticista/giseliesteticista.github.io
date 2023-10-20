import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Modal from 'react-modal';
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import pt from 'date-fns/locale/pt-BR';
registerLocale('pt-BR', pt);

import moment from 'moment-timezone';
import axios from 'axios';

import styles from '@/styles/Home.module.scss';
import Header from '@/components/Header';

moment.tz.setDefault('America/Sao_Paulo');

export default function Home() {
  const [ nome, setNome ] = useState('');
  const [ telefone, setTelefone ] = useState('');
  const [ service, setService ] = useState('');
  const [ data, setData ] = useState(new Date());
  const [ hour, setHour ] = useState('');

  const [ hourLoading, setHourLoading ] = useState(false);
  const [ loading, setLoading ] = useState(false);

  const [ avaiableHours, setAvaiableHours ] = useState([]);

  const [ modalIsOpen, setModalIsOpen] = useState(false);

  const [ appointSuccess, setAppointSuccess ] = useState(false);

  const [ prevHour, setPrevHour ] = useState('');

  const baseApi = 'https://esteticistagiseli.onrender.com';

  const router = useRouter();

  // CHECK IF IT'S SUNDAY OR MONDAY, BECAUSE THERE IS NO WORK ON THESE DAYS
  const isWeekday = (date: Date) => {
    const day = date.getDay();
    return day !== 0 && day !== 1;
  }

  const modalHandle = () => {
    setModalIsOpen(false);

    //setData(`${moment().format('YYYY-MM-DD')}`);
    document.getElementById(hour).style.backgroundColor = '#767676';
    setNome('');
    setTelefone('');
    setService('');
    setHour('');

    router.push('/agendamentos');
  }

  const getFreeAppointments = async(data: Date | any ) => {
    try {
      setAvaiableHours([]);
      setHourLoading(true);

      const response = await axios.get(`${baseApi}/agendamentos/livre/${moment(data).unix()}`, {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });

      if(response.status == 200) {
        if(moment(data).format('DD/MM/YYYY') == moment().format('DD/MM/YYYY')) {
          setAvaiableHours(response.data.data.freeHours.filter((h) => h >= moment().format('HH:mm')));
        } else {
          setAvaiableHours(response.data.data.freeHours);
        }
      }
      
    } catch (error) {
      setHourLoading(false);
      setAvaiableHours([]);
      console.log(error);
    } finally {
      setHourLoading(false);
    }
  }

  const toAppointment = async() => {
    try {
      
      setLoading(true);

      let serviceFormatted;

      switch(service) {
        case 'designSimples':
          serviceFormatted = 'Design Simples';
          break;
        case 'designHenna':
          serviceFormatted = 'Design Henna';
          break;
        case 'micropigmentacao':
          serviceFormatted = 'Micropigmentação';
          break; 
        case 'retoque':
          serviceFormatted = 'Retoque de Micropigmentação';
            break;
      }

      if(service == 'retoque' || service == 'micropigmentacao') {

        alert('Retoque ou micropigmentação devem ser agendados manualmente via whatsapp, pois é necessário uma avaliação antes.');
        window.location.href = `https://wa.me/553899032735?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20um%20${serviceFormatted}%20com%20voc%C3%AA!`;

      } else {

        if(nome && service && telefone && hour && moment(data).day() + 1 != 1 && moment(data).day() + 1 != 2) {
          const response = await axios.post(`${baseApi}/agendar`, {
            nome: nome,
            telefone: telefone,
            service: serviceFormatted,
            appointment: [ moment(data).format('DD/MM/YYYY'), hour ]
          }, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            }
          });
    
          if(response.status == 201) {

            window.localStorage.setItem('hasAppointment', 'true');
            window.localStorage.setItem('appointment', JSON.stringify(response.data.data));

            setAppointSuccess(true);
            setModalIsOpen(true);
          }
        } else {
          console.log('PREENCHA OS CAMPOS ANTES');
        }

      }

    } catch (error) {
      console.log(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getFreeAppointments(data);
    var day = data.getDay();
    if(day == 0) setData(moment(data).add(2, 'days').toDate());
    if(day == 1) setData(moment(data).add(1, 'day').toDate());
  }, []);

  useEffect(() => {
    prevHour != '' ? document.getElementById(prevHour).style.backgroundColor = '#767676' : null;
  }, [prevHour]);

  return (
    <>
      <Head>
        <title>Agendamentos - Giseli Esteticista</title>
        <meta name="description" content="Faça seus agendamentos de design com uma profissional habilitada e certificada - Giseli Santos. Sempre pronta para seu dia de beleza." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main>
      <h1>SISTEMA EM MANUTENÇÃO! VOLTAMOS EM BREVE!</h1>
      </main>
      <footer>
        <p style={{ textAlign: 'center', font: '500 1rem Red Hat Display, sans-serif'}}>Desenvolvido por <Link href="https://instagram.com/leonimeloo" target="_blank">@leonimeloo</Link></p>
      </footer>
    </>
  )
}
