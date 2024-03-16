import React, {useState, useEffect} from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { TrialType, CommiteeRole, Rank, SSOManager, SystemMode } from '../types';
import 'bootstrap/js/src/modal';
import Appointments from '../appointments/Appointments';

interface Props {
  loggedIn: boolean;
  logOut: () => void;
  logIn: () => void;
  mode: SystemMode;
}

function CommiteeAppointments({mode}: Props): JSX.Element {
  const [roleHO, setRoleHO] = useState<CommiteeRole>(CommiteeRole.NONE);
  const [roleHR, setRoleHR] = useState<CommiteeRole>(CommiteeRole.NONE);

  const [newAppointmentVisible, setNewAppointmentVisible] = useState(false);
  const [newAppointmentDate, setNewAppointmentDate] = useState(new Date());
  const [newAppointmentDescription, setNewAppointmentDescription] = useState('');
  const [newAppointmentHOslots, setNewAppointmentHOslots] = useState(0);
  const [newAppointmentHRslots, setNewAppointmentHRslots] = useState(0);

  const [kickRegistrationID, setKickRegistrationID] = useState(0);
  const [kickUserName, setKickUserName] = useState<string|null>('');
  const [kickAppointmentID, setKickAppointmentID] = useState(0);
  const [kickAppointmentDate, setKickAppointmentDate] = useState(new Date());
  const [kickAppointmentIntent, setKickAppointmentIntent] = useState<string|null>('');
  const [kickMessage, setKickMessage] = useState('');

  const [selectableDates, setSelectableDates] = useState<Array<Date>>([]);

  const [appointments, setAppointments] = useState<Array<{id: number, date: Date, description: string, slotsHO: number, slotsHR: number, locked: boolean, registrations: Array<{id: number, intent: string, customIntent: string|null, message: string|null, trial: {userId: number; type: TrialType; user: {name: string; rank: Rank;}}}>; editmode: boolean;}>>([]);
  const [archivalAppointments, setArchivalAppointments] = useState<Array<{id: number, date: Date, description: string, slotsHO: number, slotsHR: number, locked: boolean, registrations: Array<{id: number, intent: string, customIntent: string|null, message: string|null, trial: {userId: number; type: TrialType; user: {name: string; rank: Rank;}}}>;}>>([]);

  const [buttonlock, setButtonlock] = useState(false);
  const [archivalVisible, setArchivalVisible] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    updateRole();
    refreshAppointments();

    var dates = Array<Date>();
    for(var i = 0; i < 365; ++i){
      const now = new Date();
      const entry = new Date(now.setDate(now.getDate() + i));
      dates.push(entry);
    }
    setSelectableDates(dates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateRole = async function() {
    const response = await fetch(process.env.REACT_APP_API_URL + "/user/me", {
      method: "GET",
      mode: 'same-origin'
    });
    if(!response.ok){
      alert('Cannot fetch user details');
      return;
    }
    const body = await response.json();
    setRoleHO(body.data.role_HO as CommiteeRole);
    setRoleHR(body.data.role_HR as CommiteeRole);
  };

  const refreshAppointments = async function(){
    const response = await fetch(process.env.REACT_APP_API_URL + "/appointments/all", {
      method: "GET",
      mode: 'same-origin',
    });
    if(!response.ok){
      alert('Cannot fetch appointments list');
      return;
    }
    const body = await response.json() as {status:string; data: Array<{id: number, date: string, description: string, slots_HO: number, slots_HR: number, locked: boolean, registrations: Array<{id: number, intent: string, customIntent: string|null, message: string|null, trial: {userId: number; type: TrialType; user: {name: string; rank: Rank;}}}>}>};
    setAppointments(body.data.map((e) => {return {...e, date: new Date(e.date), slotsHO: e.slots_HO, slotsHR: e.slots_HR, editmode: false}}));
  }

  const refreshArchival = async function(){
    const response = await fetch(process.env.REACT_APP_API_URL + "/appointments/all/archived", {
      method: "GET",
      mode: 'same-origin',
    });
    if(!response.ok){
      alert('Cannot fetch archived appointments list');
      return;
    }
    const body = await response.json() as {status:string; data: Array<{id: number, date: string, description: string, slots_HO: number, slots_HR: number, locked: boolean, registrations: Array<{id: number, intent: string, customIntent: string|null, message: string|null, trial: {userId: number; type: TrialType; user: {name: string; rank: Rank;}}}>}>};
    setArchivalAppointments(body.data.map((e) => {return {...e, date: new Date(e.date), slotsHO: e.slots_HO, slotsHR: e.slots_HR}}));
  }

  const onCreateAppointmentAttempt = async function(){
    setButtonlock(true);
    const response = await fetch(process.env.REACT_APP_API_URL + "/appointments/new", {
      method: 'POST',
      mode: 'same-origin',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: newAppointmentDate,
        description: newAppointmentDescription,
        slots_HO: (mode === SystemMode.HO || mode === SystemMode.HO_HR) ? newAppointmentHOslots : undefined,
        slots_HR: (mode === SystemMode.HR || mode === SystemMode.HO_HR) ? newAppointmentHRslots : undefined,
      })
    });
    setButtonlock(false);
    if(!response.ok){
      alert('Cannot create new appointment');
      return;
    }
    setNewAppointmentVisible(false);
    refreshAppointments();
  };

  const onUpdateAppointmentAttempt = async function(index: number){
    setButtonlock(true);
    const response = await fetch(process.env.REACT_APP_API_URL + "/appointments/" + appointments[index].id, {
      method: 'PATCH',
      mode: 'same-origin',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description: appointments[index].description,
        slots_HO: ((mode === SystemMode.HO || mode === SystemMode.HO_HR) && roleHO === CommiteeRole.SCRIBE) ? appointments[index].slotsHO : undefined,
        slots_HR: ((mode === SystemMode.HR || mode === SystemMode.HO_HR) && roleHR === CommiteeRole.SCRIBE) ? appointments[index].slotsHR : undefined,
      })
    });
    if(!response.ok){
      setButtonlock(false);
      alert('Cannot update appointment');
      return;
    }
    await refreshAppointments();
    setButtonlock(false);
  };

  const onChangeLockAppointmentAttempt = async function(index: number, lock: boolean){
    setButtonlock(true);
    const response = await fetch(process.env.REACT_APP_API_URL + "/appointments/" + appointments[index].id + "/" + (lock ? "lock" : "unlock"), {
      method: 'PATCH',
      mode: 'same-origin',
      headers: {
        "Content-Type": "application/json",
      },
    });
    if(!response.ok){
      setButtonlock(false);
      alert('Cannot update appointment\'s lock');
      return;
    }
    await refreshAppointments();
    setButtonlock(false);
  };

  const onDeleteAppointmentAttempt = async function(index: number){
    setButtonlock(true);
    const response = await fetch(process.env.REACT_APP_API_URL + "/appointments/" + appointments[index].id, {
      method: 'DELETE',
      mode: 'same-origin',
      headers: {
        "Content-Type": "application/json",
      }
    });
    if(!response.ok){
      setButtonlock(false);
      alert('Cannot delete the appointment');
      return;
    }
    await refreshAppointments();
    setButtonlock(false);
  };

  const onKickAttempt = async function(){
    setButtonlock(true);
    const response = await fetch(process.env.REACT_APP_API_URL + "/appointments/kick/" + kickRegistrationID, {
      method: 'DELETE',
      mode: 'same-origin',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: (kickMessage !== '') ? kickMessage : undefined,
      })
    });
    if(!response.ok){
      setButtonlock(false);
      alert('Cannot kick from appointment');
      return;
    }
    document.getElementById('close_kick_modal')?.click();
    await refreshAppointments();
    setButtonlock(false);
  };

  const nameConverter = function(rank: Rank, name: string|null) {
    if(name === null) return null;
    if(rank === Rank.NONE) return 'dh ' + name;
    else if(rank === Rank.MLODZIK) return 'mł. ' + name;
    else if(rank === Rank.WYWIADOWCA) return 'wyw. ' + name;
    else if(rank === Rank.CWIK) return 'ćw. ' + name;
    else if(rank === Rank.HO) return 'HO ' + name;
    else if(rank === Rank.PWD_HO) return 'pwd. ' + name + ' HO';
    else if(rank === Rank.HR) return 'HR ' + name;
    else if(rank === Rank.PWD_HR) return 'pwd. ' + name + ' HR';
    else if(rank === Rank.PHM_HR) return 'phm. ' + name + ' HR';
    else if(rank === Rank.HM_HR) return 'hm. ' + name + ' HR';
    else return name;
  }

  const intentTranslator = function(registration: {intent: string; customIntent: string | null;}){
    if(registration.intent === 'OPEN_TRIAL'){
      return 'Otwarcie próby';
    }else if(registration.intent === 'EDIT_TRIAL'){
      return 'Zmiana zadań';
    }else if(registration.intent === 'CLOSE_TRIAL'){
      return 'Zamknięcie próby';
    }else if(registration.intent === 'CUSTOM'){
      return registration.customIntent;
    }else return null;
  }

  return (<>
    <main className="container-fluid">
      <div className="row justify-content-center">
        <div className={mode !== SystemMode.HO_HR ? "col-lg-8 col-sm-12" : "col-lg-10 col-sm-12"}>
          <div className="p-5">
            <ul className="list-group">
              <li className="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
                <h4 className="mb-1 mt-1">Lista spotkań</h4>
              </li>
              <li className="list-group-item">
                <div className="table-responsive-sm">
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col" className="nowrap">Data</th>
                        <th scope="col" className="text-center longrecord">Czas trwania</th>
                        {mode !== SystemMode.HO_HR && <th scope="col" className="nowrap text-center">Rejestracje</th>}
                        {mode === SystemMode.HO_HR && <>
                        <th scope="col" className="nowrap text-center">Rejestracje HO</th>
                        <th scope="col" className="nowrap text-center">Rejestracje HR</th>
                        </>}
                        {(roleHO === CommiteeRole.SCRIBE || roleHR === CommiteeRole.SCRIBE) && <th></th>}
                      </tr>
                    </thead>
                    <tbody id="appointment_table">
                      {
                        appointments.map((appointment, index) => {
                          const regsHO = appointment.registrations.filter((reg) => {return reg.trial.type === TrialType.HO});
                          const regsHR = appointment.registrations.filter((reg) => {return reg.trial.type === TrialType.HR});
                          return <tr>
                            <td className="nowrap" scope="row">{appointment.date.getDate() + '.' + ((appointment.date.getMonth() + 1) >= 10 ? (appointment.date.getMonth() + 1) : '0' + (appointment.date.getMonth() + 1)) + '.' + appointment.date.getFullYear()}</td>
                            <td>
                              {!appointment.editmode ? 
                                <p>{appointment.description}</p>
                              :
                                <textarea className="form-control longrecord" value={appointment.description} onChange={(e) => {const newArray = [...appointments]; newArray[index].description = e.target.value; setAppointments(newArray);}} disabled={buttonlock}
                                placeholder={(roleHO === CommiteeRole.SCRIBE && roleHR === CommiteeRole.SCRIBE) ?
                                  "Opisz czas spotkania dla kandydata, np. 'Sloty o godzinach: 16:30-17:45 (HR), 17:45-19:00 (HO), 19:00-20:15 (HO)'" : 
                                  "Opisz czas spotkania dla kandydata, np. 'Spotkanie od godz. 16.00, 1 godzina na kandydata'"}>
                                </textarea>
                              }
                              {(regsHO.length > 0 || regsHR.length > 0) ? <table className="table">
                                <thead>
                                  <tr>
                                    <th className="text-center nowrap">Imię i nazwisko</th>
                                    {mode === SystemMode.HO_HR && <th className="text-center">Stopień</th>}
                                    <th className="text-center longrecord">Cel</th>
                                    <th className="text-center nowrap">Akcje</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {
                                    appointment.registrations.toSorted((a, b) => {return (a.trial.type === TrialType.HR ? (b.trial.type === TrialType.HR ? 0 : 1) : (b.trial.type === TrialType.HR ? -1 : 0))}).map((registration) => {
                                      return <tr>
                                        <td className="text-center name">{nameConverter(registration.trial.user.rank, registration.trial.user.name)}</td>
                                        {mode === SystemMode.HO_HR && <td className="text-center">{registration.trial.type}</td>}
                                        <td className="text-center">
                                          {intentTranslator(registration)}
                                          {registration.message !== null && <><br/><br/>Wiadomość dla kapituły: {registration.message}</>}
                                        </td>
                                        <td className="nowrap">
                                          {/*<button className="btn btn-dark nowrap" onClick={(e) => alert()} disabled={buttonlock || ((registration.trial.type === TrialType.HO) ? (roleHO === CommiteeRole.NONE) : (roleHR === CommiteeRole.NONE))}>Zobacz próbę</button>*/}
                                          <button className="btn btn-dark nowrap" onClick={(e) => {navigate("/commitee/trial/" + registration.trial.userId + "/" + registration.trial.type.toLowerCase());}} disabled={buttonlock || ((registration.trial.type === TrialType.HO) ? (roleHO === CommiteeRole.NONE) : (roleHR === CommiteeRole.NONE))}>Zobacz próbę</button>
                                          {(roleHO === CommiteeRole.SCRIBE || roleHR === CommiteeRole.SCRIBE) && <button className="btn btn-danger" onClick={(e) => {setKickRegistrationID(registration.id); setKickUserName(nameConverter(registration.trial.user.rank, registration.trial.user.name)); setKickAppointmentID(registration.id); setKickAppointmentDate(appointment.date); setKickAppointmentIntent(intentTranslator(registration)); document.getElementById('open_kick_modal')?.click();}} disabled={buttonlock || ((registration.trial.type === TrialType.HO) ? (roleHO !== CommiteeRole.SCRIBE) : (roleHR !== CommiteeRole.SCRIBE))}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-square" viewBox="0 0 16 16"><path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"></path><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"></path></svg></button>}
                                        </td>
                                      </tr>;
                                    })
                                  }
                                </tbody>
                              </table> : <><br/><p>Brak zapisanych kandydatów</p></>}
                              {appointment.locked && <p>To spotkanie jest zablokowane i nie można się na nie zapisać.</p>}
                            </td>
                            {(mode === SystemMode.HO_HR || mode === SystemMode.HO) && <td className="text-center nowrap">
                              {regsHO.length} z {!appointment.editmode ?
                                appointment.slotsHO
                              :
                                <select className="form-control text-center" disabled={buttonlock || roleHO !== CommiteeRole.SCRIBE} value={appointment.slotsHO} onChange={(e) => {const newArray = [...appointments]; newArray[index].slotsHO = parseInt(e.target.value); setAppointments(newArray);}}>
                                  <option value={0} disabled={mode !== SystemMode.HO_HR || regsHO.length > 0}>0</option>
                                  <option value={1} disabled={regsHO.length > 1}>1</option>
                                  <option value={2} disabled={regsHO.length > 2}>2</option>
                                  <option value={3} disabled={regsHO.length > 3}>3</option>
                                  <option value={4} disabled={regsHO.length > 4}>4</option>
                                  <option value={5} disabled={regsHO.length > 5}>5</option>
                                  <option value={6} disabled={regsHO.length > 6}>6</option>
                                  <option value={7} disabled={regsHO.length > 7}>7</option>
                                  <option value={8} disabled={regsHO.length > 8}>8</option>
                                </select>
                              }
                            </td>}
                            {(mode === SystemMode.HO_HR || mode === SystemMode.HR) && <td className="text-center nowrap">
                              {regsHR.length} z {!appointment.editmode ?
                                appointment.slotsHR
                              :
                                <select className="form-control text-center" disabled={buttonlock || roleHR !== CommiteeRole.SCRIBE} value={appointment.slotsHR} onChange={(e) => {const newArray = [...appointments]; newArray[index].slotsHR = parseInt(e.target.value); setAppointments(newArray);}}>
                                  <option value={0} disabled={mode !== SystemMode.HO_HR || regsHR.length > 0}>0</option>
                                  <option value={1} disabled={regsHR.length > 1}>1</option>
                                  <option value={2} disabled={regsHR.length > 2}>2</option>
                                  <option value={3} disabled={regsHR.length > 3}>3</option>
                                  <option value={4} disabled={regsHR.length > 4}>4</option>
                                  <option value={5} disabled={regsHR.length > 5}>5</option>
                                  <option value={6} disabled={regsHR.length > 6}>6</option>
                                  <option value={7} disabled={regsHR.length > 7}>7</option>
                                  <option value={8} disabled={regsHR.length > 8}>8</option>
                                </select>
                              }
                            </td>}
                            {(roleHO === CommiteeRole.SCRIBE || roleHR === CommiteeRole.SCRIBE) && <td className="text-center nowrap">
                              {appointment.editmode ? 
                                <button className="btn btn-success" onClick={(e) => {onUpdateAppointmentAttempt(index);}} disabled={buttonlock}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-lg" viewBox="0 0 16 16"><path d="M13.485 1.431a1.473 1.473 0 0 1 2.104 2.062l-7.84 9.801a1.473 1.473 0 0 1-2.12.04L.431 8.138a1.473 1.473 0 0 1 2.084-2.083l4.111 4.112 6.82-8.69a.486.486 0 0 1 .04-.045z"></path></svg></button>
                              :
                                <button className="btn btn-dark" onClick={(e) => {var newArray = [...appointments]; newArray[index].editmode = true; setAppointments(newArray);}} disabled={buttonlock}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-fill" viewBox="0 0 16 16"><path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/></svg></button>
                              }
                              <button className="btn btn-danger" onClick={(e) => {onDeleteAppointmentAttempt(index);}} disabled={buttonlock || appointment.registrations.length > 0}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-square" viewBox="0 0 16 16"><path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"></path><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"></path></svg></button>
                              <br/>
                              {appointment.locked ? 
                                <button className="btn btn-dark" onClick={(e) => {onChangeLockAppointmentAttempt(index, false);}} disabled={buttonlock}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" /></svg>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M4,15V9H12V4.16L19.84,12L12,19.84V15H4Z" /></svg>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M18 1C15.24 1 13 3.24 13 6V8H4C2.9 8 2 8.89 2 10V20C2 21.11 2.9 22 4 22H16C17.11 22 18 21.11 18 20V10C18 8.9 17.11 8 16 8H15V6C15 4.34 16.34 3 18 3C19.66 3 21 4.34 21 6V8H23V6C23 3.24 20.76 1 18 1M10 13C11.1 13 12 13.89 12 15C12 16.11 11.11 17 10 17C8.9 17 8 16.11 8 15C8 13.9 8.9 13 10 13Z" /></svg>
                                </button>
                              :
                                <button className="btn btn-dark" onClick={(e) => {onChangeLockAppointmentAttempt(index, true);}} disabled={buttonlock}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M18 1C15.24 1 13 3.24 13 6V8H4C2.9 8 2 8.89 2 10V20C2 21.11 2.9 22 4 22H16C17.11 22 18 21.11 18 20V10C18 8.9 17.11 8 16 8H15V6C15 4.34 16.34 3 18 3C19.66 3 21 4.34 21 6V8H23V6C23 3.24 20.76 1 18 1M10 13C11.1 13 12 13.89 12 15C12 16.11 11.11 17 10 17C8.9 17 8 16.11 8 15C8 13.9 8.9 13 10 13Z" /></svg>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M4,15V9H12V4.16L19.84,12L12,19.84V15H4Z" /></svg>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" /></svg>
                                </button>
                              }
                            </td>}
                          </tr>
                        })
                      }
                      {newAppointmentVisible && <tr>
                        <td className="nowrap" scope="row">
                          <select className="form-control" value={newAppointmentDate.toJSON()} onChange={(e) => {setNewAppointmentDate(new Date(e.target.value))}}>
                            {
                              selectableDates.map((date) => {
                                return <option value={date.toJSON()}>{date.getDate() + '.' + ((date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + '.' + date.getFullYear()}</option>
                              })
                            }
                          </select>
                        </td>
                        <td>
                          <textarea className="form-control longrecord" value={newAppointmentDescription} onChange={(e) => setNewAppointmentDescription(e.target.value)}
                            placeholder={(roleHO === CommiteeRole.SCRIBE && roleHR === CommiteeRole.SCRIBE) ?
                              "Opisz czas spotkania dla kandydata, np. 'Sloty o godzinach: 16:30-17:45 (HR), 17:45-19:00 (HO), 19:00-20:15 (HO)'" : 
                              "Opisz czas spotkania dla kandydata, np. 'Spotkanie od godz. 16.00, 1 godzina na kandydata'"}>
                          </textarea>
                        </td>
                        {(mode === SystemMode.HO || mode === SystemMode.HO_HR) && <td className="text-center nowrap">
                          <select className="form-control text-center" disabled={roleHO !== CommiteeRole.SCRIBE} value={newAppointmentHOslots} onChange={(e) => setNewAppointmentHOslots(parseInt(e.target.value))}>
                            <option value={-1} disabled>Wybierz ilość kandydatów</option>
                            <option value={0} disabled={mode !== SystemMode.HO_HR}>brak</option>
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                            <option value={5}>5</option>
                            <option value={6}>6</option>
                            <option value={7}>7</option>
                            <option value={8}>8</option>
                          </select>
                        </td>}
                        {(mode === SystemMode.HR || mode === SystemMode.HO_HR) && <td className="text-center nowrap">
                          <select className="form-control text-center" disabled={roleHR !== CommiteeRole.SCRIBE} value={newAppointmentHRslots} onChange={(e) => setNewAppointmentHRslots(parseInt(e.target.value))}>
                            <option value={-1} disabled>Wybierz ilość kandydatów</option>
                            <option value={0} disabled={mode !== SystemMode.HO_HR}>brak</option>
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                            <option value={5}>5</option>
                            <option value={6}>6</option>
                            <option value={7}>7</option>
                            <option value={8}>8</option>
                          </select>
                        </td>}
                        <td className="text-center nowrap">
                          <button type="button" className="btn btn-dark" onClick={onCreateAppointmentAttempt} disabled={buttonlock || (mode === SystemMode.HO && (newAppointmentHOslots === -1 || newAppointmentHOslots === 0)) || (mode === SystemMode.HR && (newAppointmentHRslots === -1 || newAppointmentHRslots === 0)) || (mode === SystemMode.HO_HR && (newAppointmentHOslots === -1 || newAppointmentHOslots === 0) && (newAppointmentHRslots === -1 || newAppointmentHRslots === 0))}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-lg" viewBox="0 0 16 16">
                              <path d="M13.485 1.431a1.473 1.473 0 0 1 2.104 2.062l-7.84 9.801a1.473 1.473 0 0 1-2.12.04L.431 8.138a1.473 1.473 0 0 1 2.084-2.083l4.111 4.112 6.82-8.69a.486.486 0 0 1 .04-.045z"></path>
                            </svg>
                          </button>
                        </td>
                      </tr>}
                    </tbody>
                  </table>
                  {(roleHO === CommiteeRole.SCRIBE || roleHR === CommiteeRole.SCRIBE) && <div className="d-flex justify-content-end flex-row">
                    <button type="button" className="btn btn-dark" onClick={(e) => {setNewAppointmentDate(new Date()); setNewAppointmentDescription(''); setNewAppointmentHOslots(roleHO === CommiteeRole.SCRIBE ? -1 : 0); setNewAppointmentHRslots(roleHR === CommiteeRole.SCRIBE ? -1 : 0); setNewAppointmentVisible(true);}} disabled={newAppointmentVisible || buttonlock}>Dodaj nowe spotkanie</button>
                  </div>}
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="row justify-content-center">
        <div className={mode !== SystemMode.HO_HR ? "col-lg-8 col-sm-12" : "col-lg-10 col-sm-12"}>
          <div className="p-5">
            <ul className="list-group">
              <li className="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
                <h4 className="mb-1 mt-1">Lista minionych spotkań</h4>
              </li>
              {!archivalVisible && 
              <li className="list-group-item d-flex flex-row-reverse trial-entry">
                <button className="btn btn-dark" onClick={(e) => {setArchivalVisible(true); refreshArchival();}}>Wyświetl minione spotkania</button>
              </li>}
              {archivalVisible && <li className="list-group-item">
                <div className="table-responsive-sm">
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col" className="nowrap">Data</th>
                        <th scope="col" className="text-center longrecord">Czas trwania</th>
                        {mode !== SystemMode.HO_HR && <th scope="col" className="nowrap text-center">Rejestracje</th>}
                        {mode === SystemMode.HO_HR && <>
                        <th scope="col" className="nowrap text-center">Rejestracje HO</th>
                        <th scope="col" className="nowrap text-center">Rejestracje HR</th>
                        </>}
                        {(roleHO === CommiteeRole.SCRIBE || roleHR === CommiteeRole.SCRIBE) && <th></th>}
                      </tr>
                    </thead>
                    <tbody id="appointment_table">
                      {
                        archivalAppointments.map((appointment, index) => {
                          const regsHO = appointment.registrations.filter((reg) => {return reg.trial.type === TrialType.HO});
                          const regsHR = appointment.registrations.filter((reg) => {return reg.trial.type === TrialType.HR});
                          return <tr>
                            <td className="nowrap" scope="row">{appointment.date.getDate() + '.' + ((appointment.date.getMonth() + 1) >= 10 ? (appointment.date.getMonth() + 1) : '0' + (appointment.date.getMonth() + 1)) + '.' + appointment.date.getFullYear()}</td>
                            <td>
                              <p>{appointment.description}</p>
                              {(regsHO.length > 0 || regsHR.length > 0) ? <table className="table">
                                <thead>
                                  <tr>
                                    <th className="text-center nowrap">Imię i nazwisko</th>
                                    {mode === SystemMode.HO_HR && <th className="text-center">Stopień</th>}
                                    <th className="text-center longrecord">Cel</th>
                                    <th className="text-center nowrap">Akcje</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {
                                    appointment.registrations.toSorted((a, b) => {return (a.trial.type === TrialType.HR ? (b.trial.type === TrialType.HR ? 0 : 1) : (b.trial.type === TrialType.HR ? -1 : 0))}).map((registration) => {
                                      return <tr>
                                        <td className="text-center name">{nameConverter(registration.trial.user.rank, registration.trial.user.name)}</td>
                                        {mode === SystemMode.HO_HR && <td className="text-center">{registration.trial.type}</td>}
                                        <td className="text-center">
                                          {intentTranslator(registration)}
                                          {registration.message !== null && <><br/><br/>Wiadomość dla kapituły: {registration.message}</>}
                                        </td>
                                        <td className="nowrap">
                                          {/*<button className="btn btn-dark nowrap" onClick={(e) => alert()} disabled={buttonlock || ((registration.trial.type === TrialType.HO) ? (roleHO === CommiteeRole.NONE) : (roleHR === CommiteeRole.NONE))}>Zobacz próbę</button>*/}
                                          <button className="btn btn-dark nowrap" onClick={(e) => {navigate("/commitee/trial/" + registration.trial.userId + "/" + registration.trial.type.toLowerCase());}} disabled={buttonlock || ((registration.trial.type === TrialType.HO) ? (roleHO === CommiteeRole.NONE) : (roleHR === CommiteeRole.NONE))}>Zobacz próbę</button>
                                        </td>
                                      </tr>;
                                    })
                                  }
                                </tbody>
                              </table> : <><br/><p>Brak zapisanych kandydatów</p></>}
                            </td>
                            {(mode === SystemMode.HO_HR || mode === SystemMode.HO) && <td className="text-center nowrap">
                              {regsHO.length} z {appointment.slotsHO}
                            </td>}
                            {(mode === SystemMode.HO_HR || mode === SystemMode.HR) && <td className="text-center nowrap">
                              {regsHR.length} z {appointment.slotsHR}
                            </td>}
                          </tr>
                        })
                      }
                    </tbody>
                  </table>
                </div>
              </li>}
            </ul>
          </div>
        </div>
      </div>
    </main>
    <button type="button" className="btn" id="open_kick_modal" data-bs-toggle="modal" data-bs-target="#kick_modal" style={{display: 'none'}}></button>
    <button type="button" className="btn" id="close_kick_modal" data-bs-dismiss="modal" data-bs-target="#kick_modal" style={{display: 'none'}}></button>
    <div className="modal fade" id="kick_modal" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Wyrzuć ze spotkania</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <p>Potwiedź, że chcesz wyrzucić użytkownika <b>{kickUserName}</b> ze spotkania w dniu <b>{kickAppointmentDate.getDate() + '.' + ((kickAppointmentDate.getMonth() + 1) >= 10 ? (kickAppointmentDate.getMonth() + 1) : '0' + (kickAppointmentDate.getMonth() + 1)) + '.' + kickAppointmentDate.getFullYear()}</b> w celu {kickAppointmentIntent}.</p>
            <p>Po wyrzuceniu użytkownik otrzyma maila z informacją że nie jest już zapisany na spotkanie. Jeśli chcesz, możesz napisać mu krótką wiadomość poniżej.</p>
            <textarea className="form-control longrecord" value={kickMessage} onChange={(e) => setKickMessage(e.target.value)}
              placeholder="Tu wpisz wiadomość dla kandydata">
            </textarea>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Anuluj</button>
            <button type="button" className="btn btn-danger" onClick={onKickAttempt} disabled={buttonlock}>Wyrzuć</button>
          </div>
        </div>
      </div>
    </div>
  </>);
}

export default CommiteeAppointments;
