import React, {useState, useEffect} from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { TrialType, CommiteeRole, Rank, SSOManager } from '../types';
import { predictedDateToString, stringToPredictedDate, verifyPhone } from '../utils';

interface Props {
  loggedIn: boolean;
  logOut: () => void;
  logIn: () => void;
  type: TrialType;
}

function Trial({ type }: Props): JSX.Element {
  const [userId, setUserID] = useState(0);
  const [mentorName, setMentorName] = useState('');
  const [mentorPhone, setMentorPhone] = useState('');
  const [mentorEmail, setMentorEmail] = useState('');
  const [predictedClosingDate, setPredictedClosingDate] = useState(new Date());
  const [openedOn, setOpenedOn] = useState<Date | null>(null);
  const [closedOn, setClosedOn] = useState<Date | null>(null);
  const [archived, setArchived] = useState(false);

  const [initMode, setInitMode] = useState(false);

  const [editmode, setEditmode] = useState(false);
  const [buttonlock, setButtonLock] = useState(false);

  const [selectableDates, setSelectableDates] = useState<Array<Date>>([]);

  const [newQuestContent, setNewQuestContent] = useState('');
  const [newQuestFinishDate, setNewQuestFinishDate] = useState(new Date());
  const [newQuestVisible, setNewQuestVisible] = useState(false);
  const [newQuestButtonlock, setNewQuestButtonLock] = useState(false);

  const [quests, setQuests] = useState<Array<{id: number; content: string; finish_date: Date, editmode: boolean}>>([]);

  const navigate = useNavigate();

  useEffect(() => {
    setUserID(0);
    setMentorName('');
    setMentorPhone('');
    setMentorEmail('');
    setPredictedClosingDate(new Date());
    setOpenedOn(null);
    setClosedOn(null)
    setArchived(false);
    setInitMode(false);
    setEditmode(false);
    setButtonLock(false);
    
    refreshTrialData();

    var dates = Array<Date>();
    for(var i = 0; i < 14; ++i){
      const now = (openedOn !== null) ? openedOn : new Date();
      const entry = new Date(now.setMonth(now.getMonth() + i));
      dates.push(entry);
    }
    setSelectableDates(dates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const refreshTrialData = async function(){
    const response = await fetch(process.env.REACT_APP_API_URL + "/trial/me/" + type.toLowerCase(), {
      method: "GET",
      mode: 'same-origin',
    });
    if(!response.ok){
      if(response.status === 404){
        setInitMode(true);
        setEditmode(true);
        return;
      }else{
        alert('Cannot fetch trial details');
        return;
      }
    }
    refreshQuestsData();
    
    setInitMode(false);
    const body = await response.json();
    setUserID(body.data.userId);
    setMentorName(body.data.mentor_name);
    setMentorEmail(body.data.mentor_email);
    setMentorPhone(body.data.mentor_phone);
    setPredictedClosingDate(new Date(body.data.predicted_closing_date));
    setOpenedOn(body.data.open_date !== null ? new Date(body.data.open_date) : null);
    setClosedOn(body.data.close_date !== null ? new Date(body.data.close_date) : null);
    setArchived(body.data.archived);
  }

  const refreshQuestsData = async function(){
    const response = await fetch(process.env.REACT_APP_API_URL + "/trial/quests/me/" + type.toLowerCase(), {
      method: "GET",
      mode: 'same-origin',
    });
    if(!response.ok){
      alert('Cannot fetch trial details');
      return;
    }
    const body = await response.json() as {status:string; data: Array<{id: number; content: string; finish_date: string}>};
    setQuests(body.data.map((e) => {return {...e, finish_date: new Date(e.finish_date), editmode: false}}));
  }

  const onTrialUpdateAttempt = async function(){
    setButtonLock(true);

    const URLinsert = initMode ? 'new/' : '';
    const method = initMode ? 'POST' : 'PATCH';

    const response = await fetch(process.env.REACT_APP_API_URL + "/trial/" + URLinsert + type.toLowerCase(), {
      method: method,
      mode: 'same-origin',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mentor_email: mentorEmail,
        mentor_name: mentorName,
        mentor_phone: mentorPhone,
        predicted_closing_date: predictedClosingDate,
      })
    });
    setButtonLock(false);
    refreshTrialData();
    if(!response.ok){
      alert('Cannot update details');
      return;
    }
    setEditmode(false);
  };

  const onQuestCreateAttempt = async function(){
    setNewQuestButtonLock(true);

    const response = await fetch(process.env.REACT_APP_API_URL + "/trial/quests/new/" + type.toLowerCase(), {
      method: 'POST',
      mode: 'same-origin',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: newQuestContent,
        finish_date: newQuestFinishDate,
      })
    });
    setNewQuestButtonLock(false);
    if(!response.ok){
      alert('Cannot update details');
      return;
    }
    const body = await response.json();
    setNewQuestVisible(false);
    var newArray = [...quests];
    newArray.push({
      ...body.data,
      finish_date: new Date(body.data.finish_date),
      editmode: false,
    });
    setQuests(newArray);
  };

  const onQuestUpdateAttempt = async function(index: number){
    const response = await fetch(process.env.REACT_APP_API_URL + "/trial/quests/" + quests[index].id, {
      method: 'PATCH',
      mode: 'same-origin',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: quests[index].content,
        finish_date: quests[index].finish_date,
      })
    });
    if(!response.ok){
      refreshQuestsData();
      alert('Cannot update quest');
      return;
    }
  };

  const onQuestDeleteAttempt = async function(id: number){
    const response = await fetch(process.env.REACT_APP_API_URL + "/trial/quests/" + id, {
      method: 'DELETE',
      mode: 'same-origin',
      headers: {
        "Content-Type": "application/json",
      }
    });
    if(!response.ok){
      refreshQuestsData();
      alert('Cannot update quest');
      return;
    }
  };

  /*const nameConverter = function() {
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
  }*/

  return (
    <main className="container-fluid">
      <div className="row">
        {!initMode && <div className="col-lg-8 col-sm-12">
          <div className="p-3">
            <ul className="list-group">
              <li className="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
                <h4 className="mb-1 mt-1">Zadania</h4>
              </li>
              <li className="list-group-item">
                <div className="table-responsive-sm">
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col" className="nowrap">#</th>
                        <th scope="col" className="text-center longrecord">Zadanie</th>
                        <th scope="col" className="nowrap text-center">Termin</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody id="quest_table">
                      {
                        quests.map((quest, index) => {
                          return <tr>
                          <td className="nowrap" scope="row">{index+1}</td>
                          <td>
                            {!quest.editmode && quest.content}
                            {quest.editmode && <textarea className="form-control longrecord" value={quest.content} onChange={(e) => {var newArray = [...quests]; newArray[index].content = e.target.value; setQuests(newArray)}}></textarea>}
                          </td>
                          <td className="text-center nowrap">
                            {!quest.editmode && predictedDateToString(quest.finish_date)}
                            {quest.editmode && 
                              <select value={predictedDateToString(quest.finish_date)} onChange={(e) => {var newArray = [...quests]; newArray[index].finish_date = stringToPredictedDate(e.target.value); setQuests(newArray)}}>
                                {
                                  selectableDates.map((date) => {
                                    return <option value={predictedDateToString(date)}>{predictedDateToString(date)}</option>
                                  })
                                }
                              </select>
                            }
                          </td>
                          <td className="nowrap">
                            {!quest.editmode && <button type="button" className="btn btn-dark" onClick={(e) => {var newArray = [...quests]; newArray[index].editmode = true; setQuests(newArray)}}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-fill" viewBox="0 0 16 16">
                                <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                              </svg>
                            </button>}
                            {quest.editmode && <>
                              <button type="button" className="btn btn-danger" onClick={(e) => {var newArray = [...quests]; newArray.splice(index, 1); setQuests(newArray); onQuestDeleteAttempt(quest.id)}}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-square" viewBox="0 0 16 16"><path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"></path><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"></path></svg>
                              </button>
                              <button type="button" className="btn btn-success" onClick={(e) => {var newArray = [...quests]; newArray[index].editmode = false; setQuests(newArray); onQuestUpdateAttempt(index)}}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-lg" viewBox="0 0 16 16"><path d="M13.485 1.431a1.473 1.473 0 0 1 2.104 2.062l-7.84 9.801a1.473 1.473 0 0 1-2.12.04L.431 8.138a1.473 1.473 0 0 1 2.084-2.083l4.111 4.112 6.82-8.69a.486.486 0 0 1 .04-.045z"></path></svg>
                              </button>
                            </>}
                          </td>
                        </tr>
                        })
                      }
                      {newQuestVisible && <tr>
                        <td className="nowrap" scope="row">1</td>
                        <td><textarea className="form-control longrecord" value={newQuestContent} onChange={(e) => setNewQuestContent(e.target.value)}></textarea></td>
                        <td className="text-center nowrap">
                        <select value={predictedDateToString(newQuestFinishDate)} onChange={(e) => setNewQuestFinishDate(stringToPredictedDate(e.target.value))}>
                          {
                            selectableDates.map((date) => {
                              return <option value={predictedDateToString(date)}>{predictedDateToString(date)}</option>
                            })
                          }
                        </select>
                        </td>
                        <td className="nowrap">
                          <button type="button" className="btn btn-dark" onClick={onQuestCreateAttempt}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-lg" viewBox="0 0 16 16">
                              <path d="M13.485 1.431a1.473 1.473 0 0 1 2.104 2.062l-7.84 9.801a1.473 1.473 0 0 1-2.12.04L.431 8.138a1.473 1.473 0 0 1 2.084-2.083l4.111 4.112 6.82-8.69a.486.486 0 0 1 .04-.045z"/>
                            </svg>
                          </button>
                        </td>
                      </tr>}
                    </tbody>
                  </table>
                  <div className="d-flex justify-content-end flex-row">
                    <button type="button" className="btn btn-dark" disabled={newQuestVisible} onClick={() => {setNewQuestContent(''); setNewQuestFinishDate(new Date()); setNewQuestVisible(true)}}>Dodaj nowe</button>
                    <div className="p-2"></div>
                    <button type="button" className="btn btn-dark" id="download_trial_pdf">Pobierz PDF próby</button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>}
        <div className="col-lg-4 col-sm-12">
          <div className="p-3">
            <ul className="list-group">
              <li className="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
                <h4 className="mb-1 mt-1">Informacje o próbie</h4>
              </li>
              {initMode && <li id="trial_tutorial" className="list-group-item bg-danger text-center">
                <b>Aby kontynuować, uzupełnij poniższe dane.</b>
              </li>}
              <li className="list-group-item">
                {!editmode && <><b>Opiekun:</b> {mentorName}</>}
                {editmode && <>
                  <b>Opiekun:</b>
                  <input type="text" className="form-control" value={mentorName} onChange={(e) => setMentorName(e.target.value)}/>
                  <p><i>To pole zaktualizuje się automatycznie, jeśli opiekun ma konto w tej kapitule założone na e-mail który podałeś poniżej</i></p>
                </>}
              </li>
              <li className="list-group-item">
                {!editmode && <><b>E-mail opiekuna:</b> {mentorEmail}</>}
                {editmode && <>
                  <b>E-mail opiekuna:</b>
                  <input type="text" className="form-control" value={mentorEmail} onChange={(e) => setMentorEmail(e.target.value)}/>
                </>}
              </li>
              <li className="list-group-item">
                {!editmode && <><b>Telefon opiekuna:</b> {mentorPhone}</>}
                {editmode && <>
                  <b>Telefon opiekuna:</b>
                  <input type="text" className={verifyPhone(mentorPhone) ? "form-control" : "form-control invalid"} value={mentorPhone} onChange={(e) => setMentorPhone(e.target.value)}/>
                  {!verifyPhone(mentorPhone) && <i>Zacznij od +48</i>}
                </>}
                <p><i>To pole zaktualizuje się automatycznie, jeśli opiekun ma konto w tej kapitule założone na e-mail który podałeś powyżej</i></p>
              </li>
              <li className="list-group-item">
                {!editmode && <><b>Planowane zamknięcie stopnia:</b> {predictedDateToString(predictedClosingDate)}</>}
                {editmode && <>
                  <b>Planowane zamknięcie stopnia:</b>
                  <select value={predictedDateToString(predictedClosingDate)} onChange={(e) => setPredictedClosingDate(stringToPredictedDate(e.target.value))}>
                    {
                      selectableDates.map((date) => {
                        return <option value={predictedDateToString(date)}>{predictedDateToString(date)}</option>
                      })
                    }
                  </select>
                </>}
              </li>
              {(openedOn != null) && <li className="list-group-item" id="trial_open_div">
                <b>Próbę otwarto:</b>
              </li>}
              {(closedOn != null) && <li className="list-group-item" id="trial_closed_div">
                <b>Próbę zamknięto:</b>
              </li>}
              {!initMode && <li className="list-group-item bg-danger text-center">
                <b>Pamiętaj, żeby zapisać się na spotkanie z kapitułą!</b>
              </li>}
              <li className="list-group-item d-flex justify-content-end flex-row">
                {!editmode && <button type="button" className="btn btn-dark" onClick={(e) => setEditmode(true)} disabled={buttonlock || archived}>Edytuj</button>}
                {editmode && <button type="button" className="btn btn-dark" onClick={onTrialUpdateAttempt} disabled={buttonlock || archived || !verifyPhone(mentorPhone)}>Zapisz</button>}
                {editmode && <button type="button" className="btn btn-light" onClick={(e) => {setEditmode(false); refreshTrialData();}} disabled={buttonlock}>Anuluj</button>}
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="p-4"></div>
      {!initMode && <div className="row justify-content-center firstrun-shadow">
        <div className="col-9">
          <div className="p-5">
            <ul className="list-group">
              <li className="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
                <h4 className="mb-1 mt-1">Załączniki</h4>
              </li>
              <li className="list-group-item">
                <div className="album py-5">
                  <div className="container">
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3" id="attachments_div">
                      <div className="col" id="attachment1">
                        <div className="card shadow-sm attachment">
                          <svg className="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder: Thumbnail" preserveAspectRatio="xMidYMid slice" focusable="false"><title>Placeholder</title><rect width="100%" height="100%" fill="#55595c"></rect><text x="50%" y="50%" fill="#eceeef" dy=".3em">Thumbnail</text></svg>
                          <div className="card-body">
                            <p className="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>
                            <div className="d-flex justify-content-between align-items-center">
                              <small className="text-muted">12.06.2021 15:30</small>
                              <div className="btn-group">
                                <button type="button" className="btn btn-sm btn-danger">Usuń</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>              
                      <div className="col"  id="attachment_new">
                        <div className="card attachment" data-bs-toggle="modal" data-bs-target="#new_attachment">
                          <svg className="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" role="img" preserveAspectRatio="xMidYMid slice" focusable="false">
                            <rect width="100%" height="100%" fill="#55595c"></rect>
                            <text x="50%" y="80%" fill="#eceeef" dy=".3em">Dodaj nowy załącznik</text>
                            <g>
                              <svg fill="#eceeef" x="0" y="15%" xmlns="http://www.w3.org/2000/svg" width="auto" height="50%" className="bi bi-file-earmark-plus" viewBox="0 0 16 16">
                                <path d="M8 6.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V11a.5.5 0 0 1-1 0V9.5H6a.5.5 0 0 1 0-1h1.5V7a.5.5 0 0 1 .5-.5z"/>
                                <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                              </svg>
                            </g>
                          </svg>
                        </div>
                      </div>                  
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="col-9 p-5 pt-0 firstrun-shadow">
          <div className="p-5">
            <ul className="list-group">
              <li className="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
                <h4 className="mb-1 mt-1">Komentarze i historia zmian</h4>
              </li>
              <li className="list-group-item">
                <div className="table-responsive-sm">
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col" className="text-center nowrap">Data</th>
                        <th scope="col" className="longrecord">Operacja</th>
                      </tr>
                    </thead>
                    <tbody id="logbook">
                      <tr>
                        <td className="nowrap" scope="row">12.05.2022 12:59</td>
                        <td>Kandydat dodał zadanie o treści "Będę się mył raz w tygodniu"</td>
                      </tr>
                      <tr>
                        <td className="nowrap" scope="row">12.08.2022 13:00</td>
                        <td>Kandydat zmienił treść zadania z "Będę się mył dwa razy w tygodniu" na "Będę się mył raz w tygodniu".</td>
                      </tr>
                      <tr className="table-info">
                        <td className="nowrap" scope="row">12.08.2022 13:30</td>
                        <td>Kapituła sugeruje zmianę zadania dotyczącego mycia się na bardziej ambitne.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>}
    </main>
  );
}

export default Trial;
