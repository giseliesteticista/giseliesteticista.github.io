import React, { useEffect, useState } from 'react';

import styles from '@/styles/Agendamentos.module.scss';
import { useRouter } from 'next/router';

import moment from 'moment-timezone';
import axios from 'axios';
import Header from '@/components/Header';

type AppData = {
    id: string;
    nome: string;
    telefone: string;
    service: string;
}

export default function Agendamentos() {
    const [ hasApp, setHasApp ] = useState(false);
    const [ appData, setAppData ] = useState<AppData>([] as unknown as AppData);
    const [ date, setDate ] = useState([]);

    const [ telefone, setTelefone ] = useState<string>('');

    const [ loading, setLoading ] = useState(false);

    const [ loaded, setLoaded ] = useState(false);

    const baseApi = 'https://esteticistagiseli.onrender.com';

    const [ appointmentsData, setAppointmentsData ] = useState([]);

    const [ excludeLoad, setExcludeLoad ] = useState(false);

    const router = useRouter();

    useEffect(() => {
        if(window.localStorage.getItem('hasAppointment') == 'true') {
            setHasApp(true);
            setAppData(JSON.parse(localStorage.getItem('appointment')));
            setDate([ JSON.parse(localStorage.getItem('appointment')).appointment.data, JSON.parse(localStorage.getItem('appointment')).appointment.hora ])
        }
    }, []);

    const getApp = async() => {
        try {
            if(telefone.length >= 9 && telefone.length <= 11) {
                setLoading(true);

                const response = await axios.get(`${baseApi}/agendamentos`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    }
                });

                if(response.status == 200 || response.status == 201) {
                    setLoaded(true);

                    const finalResult = response.data.data.filter((el) => el.telefone.length > 9 && el.telefone.slice(2) == telefone && el.nome != 'Busy' && el.nome != 'Teste' || el.telefone == telefone && el.nome != 'Busy' && el.nome != 'Teste');

                    setAppointmentsData(finalResult);
                } else {
                    alert('Não foi possível encontrar nenhum agendamento com este número de telefone! Verifique se está correto!');
                }
            } else {
                alert('Telefone inválido. Digite o número corretamente!');
            }
        
        } catch(e) {
            alert('Não foi possível encontrar nenhum agendamento com este número de telefone! Verifique se está correto!');
            setLoading(false);
        } finally {
            setLoading(false);
        }
    }

    const deleteAppointment = async(id: string) => {
        try {

            setExcludeLoad(true);

            const response = await axios.delete(`${baseApi}/agendamentos/excluir/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                }
            });

            if(response.status == 200 || response.status == 201) {
                alert(`${response.data.message}`);
                setExcludeLoad(false);
                if(JSON.parse(localStorage.getItem('appointment')).id == id) {
                    localStorage.removeItem('hasAppointment');
                    localStorage.removeItem('appointment');
                }
                router.reload();
            } else {
                alert('Não foi possível excluir o agendamento. Tente novamente ou recarregue a página!');
                setExcludeLoad(false);
            }

        } catch(e) {
            alert('Não foi possível excluir o agendamento. Tente novamente ou recarregue a página!');
            setExcludeLoad(false);
            console.log(e);
        } finally {
            setExcludeLoad(false);
        }
    }

    return (
        <>
        <Header />
        <div className={styles.content}>
            {
                hasApp ? 
                <>
                    <h3>ÚLTIMO AGENDAMENTO</h3>
                    <p>Aqui você poderá ver seu último agendamento realizado.</p>

                    <div className={styles.appoints}>
                        <p>Nome: <strong>{appData.nome}</strong></p>
                        <p>Telefone: <strong>{appData.telefone}</strong></p>
                        <p>Serviço: <strong>{appData.service}</strong></p>
                        <p>Data: <strong>{date[0]}</strong></p>
                        <p>Horário: <strong>{date[1]}</strong></p>
                        { excludeLoad ? <p>EXCLUINDO SEU AGENDAMENTO...</p> : <button onClick={() => deleteAppointment(appData.id)}>EXCLUIR AGENDAMENTO</button> }
                    </div>
                </>
                :
                null
            }

            <h3 style={{ marginTop: 20 }}>MEUS AGENDAMENTOS</h3>
            <p>Aqui você poderá ver todos seus outros agendamentos</p>

            <p style={{ textAlign: 'center', marginTop: 10 }}>Por gentileza, não atrase seu horário! <br />Em caso de desistência, favor avisar com antecedência.</p>

            {
                !loaded && appointmentsData.length < 1 ?
                    <div className={styles.login}>
                    <p>Entre com o número de telefone cadastrado no agendamento para ver:</p>

                    <input 
                        type='tel' 
                        maxLength={11} 
                        minLength={9} 
                        placeholder='Telefone'
                        value={telefone}
                        onChange={txt => setTelefone(txt.target.value)}
                        required
                    />

                    {
                        !loading ?
                        <>
                            <button 
                            className={styles.submitButton} 
                            type='submit'
                            onClick={getApp}
                            >
                                CONSULTAR
                            </button>
                            <button 
                            className={styles.submitButton} 
                            type='submit'
                            style={{ marginTop: 6 }}
                            onClick={() => router.push('/')}
                            >
                                NOVO AGENDAMENTO
                            </button>
                        </>
                        :
                        <p>CARREGANDO...</p>
                    }
                    </div>
                :
                <div>
                    {
                        appointmentsData.length >= 1 ? 
                        appointmentsData.map((appoint, index) => {
                            return (
                                <div className={styles.appoints} key={index}>
                                    <p>Nome: <strong>{appoint.nome}</strong></p>
                                    <p>Telefone: <strong>{appoint.telefone}</strong></p>
                                    <p>Serviço: <strong>{appoint.service}</strong></p>
                                    <p>Data: <strong>{appoint.appointment.data}</strong></p>
                                    <p>Horário: <strong>{appoint.appointment.hora}</strong></p>
                                    { excludeLoad ? <p>EXCLUINDO SEU AGENDAMENTO...</p> : <button onClick={() => deleteAppointment(appoint.id)}>EXCLUIR AGENDAMENTO</button> }
                                </div>
                            )
                        })
                        :
                        <div className={styles.login}>
                            <h3>Não encontramos nenhum agendamento com esse número de telefone.</h3>
                            <button 
                            className={styles.submitButton} 
                            type='submit'
                            style={{ marginTop: 6 }}
                            onClick={() => router.push('/')}
                            >
                                NOVO AGENDAMENTO
                            </button>
                        </div>
                    }
                </div>
            }
        </div>
        </>
    )
}
