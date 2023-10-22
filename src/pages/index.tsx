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
      <main className={styles.main}>
        <h1 className={styles.title}>AGENDAMENTOS</h1>
        <p className={styles.desc}>Faça seu agendamento de forma simples, rápida e em poucos passos.</p>

        <div className={styles.appointmentForm}>
          <input 
            type='text' 
            placeholder='Nome' 
            value={nome} 
            onChange={txt => setNome(txt.target.value)} 
          />

          <input 
          type='tel' 
          placeholder='Telefone' 
          minLength={8} 
          maxLength={11} 
          value={telefone} 
          onChange={txt => setTelefone(txt.target.value)}
          />

          <select 
          className={styles.servicesSelector}
          defaultValue=''
          value={service}
          onChange={(e) => setService(e.target.value)}
          >
            <option value='' disabled>Clique para selecionar um serviço:</option>
            <option value='designSimples'>Design Simples</option>
            <option value='designHenna'>Design Henna</option>
            <option value='micropigmentacao'>Micropigmentação</option>
            <option value='retoque'>Retoque de Micropigmentação</option>
          </select>

          <label htmlFor="data">Data e horário do agendamento:</label>
          <DatePicker
            selected={data}
            onChange={(date) => {
              setData(date);
              getFreeAppointments(moment(date).format('YYYY-MM-DD'));
            }}
            filterDate={isWeekday}
            placeholderText={data}
            dateFormat="dd/MM/yyyy"
            minDate={new Date()}
            maxDate={moment().add(62, 'days').toDate()}
            locale="pt-BR"
            />

          <div className={styles.freeHours} id="freehours">
            {
              avaiableHours.length > 0 ?
              avaiableHours.map((hrs, i) => {
                return <button id={`${hrs}`} key={i} onClick={() => {
                  setPrevHour(hour);
                  setHour(hrs);
                  document.getElementById(hrs).style.backgroundColor = 'green';
                }}
                >{hrs}</button>
              })
              : hourLoading ? <h3 style={{ color: 'black', font: '500 1.1.rem Red Hat Display, sans-serif' }}>CARREGANDO HORÁRIOS DISPONÍVEIS</h3> : <h3 style={{ color: 'black', font: '500 1.1.rem Red Hat Display, sans-serif' }}>SEM HORÁRIOS DISPONÍVEIS! ESCOLHA OUTRA DATA.</h3>
            }
          </div>
        
          {
            !loading ?
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <button 
            type="submit" 
            className={styles.submitButton}
            onClick={toAppointment}
            >
              AGENDAR
            </button>
            <button 
            type="submit" 
            className={styles.submitButton}
            onClick={() => router.push('/agendamentos')}
            >
              VER AGENDAMENTOS
            </button>
          </div>
          :
          <h3 style={{ color: 'black', font: '500 1.1.rem Red Hat Display, sans-serif' }}>CARREGANDO...</h3> 
          }
          <Modal
          isOpen={modalIsOpen}
          onRequestClose={modalHandle}
          contentLabel="Sucesso!"
          style={{
            content: {
              width: '80%',
              top: '50%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              marginRight: '-50%',
              transform: 'translate(-50%, -50%)',
            }
          }}
          >
              {
                appointSuccess ? 
                <div>
                  <h3 style={{
                    font: `900 1.6rem Red Hat Display, sans-serif`,
                    color: 'black',
                    textAlign: 'center',
                    marginTop: 20,
                  }}>Agendamento realizado com sucesso!</h3>
                  <div style={{ padding: '40px' }}>
                    <p style={{ font: `400 1rem Red Hat Display, sans-serif`, color: 'black', marginBottom: '12px'}}>Nome: {`${nome}`}</p>
                    <p style={{ font: `400 1rem Red Hat Display, sans-serif`, color: 'black', marginBottom: '12px' }}>Telefone: {`${telefone}`}</p>
                    <p style={{ font: `400 1rem Red Hat Display, sans-serif`, color: 'black', marginBottom: '12px' }}>Data: {`${moment(data).format('DD/MM/YYYY')}`}</p>
                    <p style={{ font: `400 1rem Red Hat Display, sans-serif`, color: 'black', marginBottom: '12px' }}>Horário: {`${hour}`}</p>
                  </div>
                </div>
                : 
                <div>
                <h3 style={{
                  font: `900 1.6rem Red Hat Display, sans-serif`,
                  color: 'black',
                  textAlign: 'center',
                  marginTop: 20,
                }}>Agendamento não realizado!</h3>
                <div style={{ padding: '40px' }}>
                    <p style={{ font: `400 1rem Red Hat Display, sans-serif`, color: 'black', marginBottom: '12px'}}>Não foi possível completar seu agendamento, por favor, recarregue a página e tente novamente. Se o erro persistir, contate Giseli.</p>
                </div>
              </div>
              }
              <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%'
              }}
              >
                <button 
                style={{
                  cursor: 'pointer',
                  padding: '11px 22px',
                  backgroundColor: '#bb9f4e',
                  border: '1px solid #bb9f4e',
                  color: 'white',
                  font: `900 1rem Red Hat Display, sans-serif`,
                }}
                onClick={modalHandle}
                >
                  OK
                </button>
              </div>
          </Modal>
        </div>
      </main>
      <footer>
        <p style={{ textAlign: 'center', font: '500 1rem Red Hat Display, sans-serif'}}>Desenvolvido por <Link href="https://instagram.com/leonimeloo" target="_blank">@leonimeloo</Link></p>
      </footer>
    </>
  )
}
