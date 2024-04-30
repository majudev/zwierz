import React, {useState, useEffect} from 'react';
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { TrialType, CommiteeRole, Rank, SSOManager, SystemMode } from '../types';
import { predictedDateToString, stringToPredictedDate, verifyPhone } from '../utils';
import 'bootstrap/js/src/modal';

interface Props {
  loggedIn: boolean;
  logOut: () => void;
  logIn: () => void;
  mode: SystemMode;
}

function ShowTrial({ mode }: Props): JSX.Element {
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidateRank, setCandidateRank] = useState(Rank.NONE);
  const [candidatePhone, setCandidatePhone] = useState('');
  const [candidateFn, setCandidateFn] = useState('');
  const [candidateTeamName, setCandidateTeamName] = useState('');
  const [candidateInterests, setCandidateInterests] = useState<Array<string>>([]);
  const [mentorName, setMentorName] = useState('');
  const [mentorPhone, setMentorPhone] = useState('');
  const [mentorEmail, setMentorEmail] = useState('');
  const [predictedClosingDate, setPredictedClosingDate] = useState(new Date());
  const [openedOn, setOpenedOn] = useState<Date | null>(null);
  const [closedOn, setClosedOn] = useState<Date | null>(null);
  const [archived, setArchived] = useState(false);

  const [buttonlock, setButtonLock] = useState(false);

  const [selectableDates, setSelectableDates] = useState<Array<Date|null>>([]);
  const [dialogDateSelector, setDialogDateSelector] = useState<Date|null>(null);

  const [quests, setQuests] = useState<Array<{id: number; content: string; finish_date: Date}>>([]);

  const [attachments, setAttachments] = useState<Array<{id: number; name: string; extension: string; created_at: Date, thumbnail: string | null; size: number, img: JSX.Element}>>([]);

  const { userId, type } = useParams();

  useEffect(() => {
    setCandidateName('');
    setCandidateEmail('');
    setCandidateRank(Rank.NONE);
    setCandidatePhone('');
    setCandidateFn('');
    setCandidateTeamName('');
    setCandidateInterests([]);
    setMentorName('');
    setMentorPhone('');
    setMentorEmail('');
    setPredictedClosingDate(new Date());
    setOpenedOn(null);
    setClosedOn(null)
    setArchived(false);
    setButtonLock(false);

    setQuests([]);
    
    refreshUserData();
    refreshTrialData();

    var dates = Array<Date|null>();
    dates.push(null);
    for(var i = -366; i < 366; ++i){
      const now = new Date();
      const entry = new Date(now.setDate(now.getDate() + i));
      dates.push(entry);
    }
    setSelectableDates(dates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const refreshUserData = async function(){
    const response = await fetch(process.env.REACT_APP_API_URL + "/user/" + userId, {
      method: "GET",
      mode: 'same-origin',
    });
    if(!response.ok){
      alert('Cannot fetch user details');
      return;
    }
    const body = await response.json();
    setCandidateName(body.data.name);
    setCandidateEmail(body.data.email);
    setCandidateRank(body.data.rank);
    setCandidatePhone(body.data.phone);
    setCandidateTeamName(body.data.team.name);
    setCandidateInterests((body.data.interests as Array<{text: string}>).map(e => e.text));
    setCandidateFn(body.data.function);
  }

  const refreshTrialData = async function(){
    const response = await fetch(process.env.REACT_APP_API_URL + "/trial/" + userId + "/" + type, {
      method: "GET",
      mode: 'same-origin',
    });
    if(!response.ok){
      alert('Cannot fetch trial details');
      return;
    }
    refreshQuests();
    refreshAttachmentsList();
    
    const body = await response.json();
    setMentorName(body.data.mentor_name);
    setMentorEmail(body.data.mentor_email);
    setMentorPhone(body.data.mentor_phone);
    setPredictedClosingDate(new Date(body.data.predicted_closing_date));
    setOpenedOn(body.data.open_date !== null ? new Date(body.data.open_date) : null);
    setClosedOn(body.data.close_date !== null ? new Date(body.data.close_date) : null);
    setArchived(body.data.archived);
  }

  const refreshQuests = async function(){
    const response = await fetch(process.env.REACT_APP_API_URL + "/trial/quests/" + userId + "/" + type, {
      method: "GET",
      mode: 'same-origin',
    });
    if(!response.ok){
      alert('Cannot fetch quests list');
      return;
    }
    const body = await response.json() as {status:string; data: Array<{id: number; content: string; finish_date: string}>};
    setQuests(body.data.map((e) => {return {...e, finish_date: new Date(e.finish_date)}}));
  }

  const onTrialChangeArchivalStateAttempt = async function(state: boolean){
    setButtonLock(true);

    const response = await fetch(process.env.REACT_APP_API_URL + "/trial/archived/" + userId + "/" + type?.toLowerCase() + "/" + (state ? "yes" : "no"), {
      method: 'PATCH',
      mode: 'same-origin',
      headers: {
        "Content-Type": "application/json",
      }
    });
    setButtonLock(false);
    refreshTrialData();
    if(!response.ok){
      alert('Cannot update details');
      return;
    }
  };

  const onOpenCloseAttempt = async function(action: 'open'|'close', when: Date|null){
    setButtonLock(true);

    const response = await fetch(process.env.REACT_APP_API_URL + "/trial/" + action + "/" + userId + "/" + type?.toLowerCase() + "/" + encodeURIComponent(dialogDateSelector !== null ? JSON.stringify(dialogDateSelector) : "null"), {
      method: 'PATCH',
      mode: 'same-origin',
      headers: {
        "Content-Type": "application/json",
      }
    });
    setButtonLock(false);
    refreshTrialData();
    if(!response.ok){
      alert('Cannot update details');
      return;
    }
    document.getElementById('open_opentrial_modal')?.click();
    document.getElementById('open_closetrial_modal')?.click();
  };

  const refreshAttachmentsList = async function(){
    const response = await fetch(process.env.REACT_APP_API_URL + "/trial/attachments/" + userId + "/" + type, {
      method: "GET",
      mode: 'same-origin',
    });
    if(!response.ok){
      alert('Cannot fetch attachments list');
      return;
    }
    const body = await response.json() as {status:string; data: Array<{id: number; name: string; extension: string; created_at: string, size: number}>};
    setAttachments(body.data.map((entry) => {
      var src = null;
      if(entry.extension.toLowerCase() === 'pdf'){
        src = <svg className="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" role="img" preserveAspectRatio="xMidYMid slice" focusable="false"><rect width="100%" height="100%" fill="#eceeef"></rect><g><svg x="0" y="25%" width="auto" height="50%" viewBox="0 0 24 24"> <path fill="currentColor" d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M9.5 11.5C9.5 12.3 8.8 13 8 13H7V15H5.5V9H8C8.8 9 9.5 9.7 9.5 10.5V11.5M14.5 13.5C14.5 14.3 13.8 15 13 15H10.5V9H13C13.8 9 14.5 9.7 14.5 10.5V13.5M18.5 10.5H17V11.5H18.5V13H17V15H15.5V9H18.5V10.5M12 10.5H13V13.5H12V10.5M7 10.5H8V11.5H7V10.5Z" /></svg></g></svg>;
      }else if(entry.extension.toLowerCase() === 'xls' || entry.extension.toLowerCase() === 'xlsx' || entry.extension.toLowerCase() === 'ods'){
        src = <svg className="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" role="img" preserveAspectRatio="xMidYMid slice" focusable="false"><rect width="100%" height="100%" fill="#009900"></rect><g><svg x="0" y="25%" width="auto" height="50%" viewBox="0 0 24 24"><path fill="currentColor" d="M21.17 3.25Q21.5 3.25 21.76 3.5 22 3.74 22 4.08V19.92Q22 20.26 21.76 20.5 21.5 20.75 21.17 20.75H7.83Q7.5 20.75 7.24 20.5 7 20.26 7 19.92V17H2.83Q2.5 17 2.24 16.76 2 16.5 2 16.17V7.83Q2 7.5 2.24 7.24 2.5 7 2.83 7H7V4.08Q7 3.74 7.24 3.5 7.5 3.25 7.83 3.25M7 13.06L8.18 15.28H9.97L8 12.06L9.93 8.89H8.22L7.13 10.9L7.09 10.96L7.06 11.03Q6.8 10.5 6.5 9.96 6.25 9.43 5.97 8.89H4.16L6.05 12.08L4 15.28H5.78M13.88 19.5V17H8.25V19.5M13.88 15.75V12.63H12V15.75M13.88 11.38V8.25H12V11.38M13.88 7V4.5H8.25V7M20.75 19.5V17H15.13V19.5M20.75 15.75V12.63H15.13V15.75M20.75 11.38V8.25H15.13V11.38M20.75 7V4.5H15.13V7Z" /></svg></g></svg>;
      }else if(entry.extension.toLowerCase() === 'doc' || entry.extension.toLowerCase() === 'docx' || entry.extension.toLowerCase() === 'odt'){
        src = <svg className="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" role="img" preserveAspectRatio="xMidYMid slice" focusable="false"><rect width="100%" height="100%" fill="#3366ff"></rect><g><svg x="0" y="25%" width="auto" height="50%" viewBox="0 0 24 24"><path fill="currentColor" d="M21.17 3.25Q21.5 3.25 21.76 3.5 22 3.74 22 4.08V19.92Q22 20.26 21.76 20.5 21.5 20.75 21.17 20.75H7.83Q7.5 20.75 7.24 20.5 7 20.26 7 19.92V17H2.83Q2.5 17 2.24 16.76 2 16.5 2 16.17V7.83Q2 7.5 2.24 7.24 2.5 7 2.83 7H7V4.08Q7 3.74 7.24 3.5 7.5 3.25 7.83 3.25M7.03 11.34L8.23 15.28H9.6L10.91 8.72H9.53L8.75 12.6L7.64 8.85H6.5L5.31 12.62L4.53 8.72H3.09L4.4 15.28H5.77M20.75 19.5V17H8.25V19.5M20.75 15.75V12.63H12V15.75M20.75 11.38V8.25H12V11.38M20.75 7V4.5H8.25V7Z" /></svg></g></svg>;
      }else if(entry.extension.toLowerCase() === 'ppt' || entry.extension.toLowerCase() === 'pptx' || entry.extension.toLowerCase() === 'odp'){
        src = <svg className="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" role="img" preserveAspectRatio="xMidYMid slice" focusable="false"><rect width="100%" height="100%" fill="#ffa64d"></rect><g><svg x="0" y="25%" width="auto" height="50%" viewBox="0 0 24 24"><path fill="currentColor" d="M13.25 3.25Q14.46 3.25 15.58 3.56 16.7 3.88 17.67 4.45 18.64 5 19.44 5.81 20.23 6.61 20.8 7.58 21.38 8.55 21.69 9.67 22 10.79 22 12 22 13.21 21.69 14.33 21.38 15.45 20.8 16.42 20.23 17.39 19.44 18.19 18.64 19 17.67 19.55 16.7 20.13 15.58 20.44 14.46 20.75 13.25 20.75 12.18 20.75 11.15 20.5 10.12 20.24 9.2 19.76 8.28 19.27 7.5 18.58 6.69 17.88 6.07 17H2.83Q2.5 17 2.24 16.76 2 16.5 2 16.17V7.83Q2 7.5 2.24 7.25 2.5 7 2.83 7H6.07Q6.69 6.12 7.5 5.42 8.28 4.72 9.2 4.24 10.13 3.76 11.15 3.5 12.18 3.25 13.25 3.25M13.88 4.53V11.37H20.72Q20.6 10 20.03 8.81 19.46 7.62 18.55 6.7 17.64 5.79 16.43 5.22 15.23 4.65 13.88 4.53M9.5 10.84Q9.5 10.27 9.3 9.87 9.11 9.46 8.78 9.21 8.45 8.95 8 8.84 7.55 8.72 7 8.72H4.37V15.27H5.91V13H6.94Q7.42 13 7.87 12.84 8.33 12.7 8.69 12.43 9.05 12.17 9.27 11.76 9.5 11.36 9.5 10.84M13.25 19.5Q14.23 19.5 15.14 19.26 16.04 19 16.85 18.58 17.66 18.13 18.33 17.5 19 16.89 19.5 16.13 20 15.36 20.33 14.47 20.64 13.58 20.72 12.62H12.64V4.53Q11.19 4.65 9.91 5.29 8.63 5.93 7.67 7H11.17Q11.5 7 11.76 7.25 12 7.5 12 7.83V16.17Q12 16.5 11.76 16.76 11.5 17 11.17 17H7.67Q8.2 17.6 8.84 18.06 9.5 18.5 10.19 18.84 10.91 19.17 11.68 19.33 12.45 19.5 13.25 19.5M6.85 10Q7.32 10 7.61 10.19 7.89 10.38 7.89 10.89 7.89 11.11 7.79 11.25 7.69 11.39 7.53 11.5 7.37 11.57 7.18 11.6 7 11.64 6.8 11.64H5.91V10H6.85Z" /></svg></g></svg>;
      }else if(entry.extension.toLowerCase() === 'png' || entry.extension.toLowerCase() === 'jpg' || entry.extension.toLowerCase() === 'jpeg' || entry.extension.toLowerCase() === 'bmp' || entry.extension.toLowerCase() === 'tif' || entry.extension.toLowerCase() === 'tiff' || entry.extension.toLowerCase() === 'svg'){
        src = <svg className="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" role="img" preserveAspectRatio="xMidYMid slice" focusable="false"><rect width="100%" height="100%" fill="#eceeef"></rect><g><svg x="0" y="25%" width="auto" height="50%" viewBox="0 0 24 24"><path d="M20,5A2,2 0 0,1 22,7V17A2,2 0 0,1 20,19H4C2.89,19 2,18.1 2,17V7C2,5.89 2.89,5 4,5H20M5,16H19L14.5,10L11,14.5L8.5,11.5L5,16Z" /></svg></g></svg>;
      }else{
        src = <svg className="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" role="img" preserveAspectRatio="xMidYMid slice" focusable="false"><rect width="100%" height="100%" fill="#eceeef"></rect><g><svg x="0" y="25%" width="auto" height="50%" viewBox="0 0 24 24"> <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"></path></svg></g></svg>;
      }

      return {
        ...entry,
        created_at: new Date(entry.created_at),
        thumbnail: null,
        img: src,
      }
    }));
    attachments.forEach((attachment) => {
      fetch(process.env.REACT_APP_API_URL + "/trial/attachments/thumbnail/" + attachment.id, {
        method: "GET",
        mode: 'same-origin',
      }).then(async (img) => {
        if(img.ok){
          const base64 = URL.createObjectURL(await img.blob());
          var newArray = [...attachments];
          newArray[newArray.indexOf(newArray.filter((v) => {return v.id === attachment.id})[0])].img = <img src={base64} height="225"></img>;
          setAttachments(newArray);
          return;
        }
      })
    });
  }

  const nameConverter = function() {
    if(candidateRank === Rank.NONE) return 'dh ' + candidateName;
    else if(candidateRank === Rank.MLODZIK) return 'mł. ' + candidateName;
    else if(candidateRank === Rank.WYWIADOWCA) return 'wyw. ' + candidateName;
    else if(candidateRank === Rank.CWIK) return 'ćw. ' + candidateName;
    else if(candidateRank === Rank.HO) return 'HO ' + candidateName;
    else if(candidateRank === Rank.PWD_HO) return 'pwd. ' + candidateName + ' HO';
    else if(candidateRank === Rank.HR) return 'HR ' + candidateName;
    else if(candidateRank === Rank.PWD_HR) return 'pwd. ' + candidateName + ' HR';
    else if(candidateRank === Rank.PHM_HR) return 'phm. ' + candidateName + ' HR';
    else if(candidateRank === Rank.HM_HR) return 'hm. ' + candidateName + ' HR';
    else return candidateName;
  }

  return (<>
    <main className="container-fluid">
      <div className="row">
        <div className="col-lg-8 col-sm-12">
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
                      </tr>
                    </thead>
                    <tbody id="quest_table">
                      {
                        quests.map((quest, index) => {
                          return <tr>
                          <td className="nowrap" scope="row">{index+1}</td>
                          <td>
                            {quest.content}
                          </td>
                          <td className="text-center nowrap">
                            {predictedDateToString(quest.finish_date)}
                          </td>
                        </tr>
                        })
                      }
                    </tbody>
                  </table>
                  <div className="d-flex justify-content-end flex-row">
                    <button type="button" className="btn btn-dark" id="download_trial_pdf">Pobierz PDF próby</button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="col-lg-4 col-sm-12">
          <div className="p-3">
            <ul className="list-group">
              <li className="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
                <h4 className="mb-1 mt-1">Informacje o próbie</h4>
              </li>
              <li className="list-group-item">
                <b>Imię i nazwisko:</b> {nameConverter()}
              </li>
              <li className="list-group-item">
                <b>E-mail:</b> {candidateEmail}
              </li>
              <li className="list-group-item">
                <b>Telefon:</b> {candidatePhone}
              </li>
              <li className="list-group-item">
                <b>Drużyna:</b> {candidateTeamName}
              </li>
              <li className="list-group-item">
                <b>Funkcja:</b> {candidateFn}
              </li>
              <li className="list-group-item">
                <b>Zainteresowania:</b>
                <ul>
                  {
                    candidateInterests.map((interest) => {
                      return <li>{interest}</li>
                    })
                  }
                </ul>
              </li>
              <li className="list-group-item">
                <b>Opiekun:</b> {mentorName}
              </li>
              <li className="list-group-item">
                <b>E-mail opiekuna:</b> {mentorEmail}
              </li>
              <li className="list-group-item">
                <b>Telefon opiekuna:</b> {mentorPhone}
              </li>
              <li className="list-group-item">
                <b>Planowane zamknięcie stopnia:</b> {predictedDateToString(predictedClosingDate)}
              </li>
              {(openedOn != null) && <li className="list-group-item">
                <b>Próbę otwarto:</b> {dateToString(openedOn)}
              </li>}
              {(closedOn != null) && <li className="list-group-item">
                <b>Próbę zamknięto:</b> {dateToString(closedOn)}
              </li>}
              <li className="list-group-item">
                <div className="d-flex flex-row-reverse">
                  {!archived && <button className="btn btn-danger" onClick={(e) => {onTrialChangeArchivalStateAttempt(true);}} disabled={buttonlock}>Archiwizuj próbę</button>}
                  {archived && <button className="btn btn-danger" onClick={(e) => {onTrialChangeArchivalStateAttempt(false);}} disabled={buttonlock}>Dearchiwizuj próbę</button>}
                  <button className="btn btn-dark" onClick={(e) => {setDialogDateSelector(openedOn !== null ? openedOn : (new Date())); document.getElementById('open_opentrial_modal')?.click();}} disabled={buttonlock}>{(openedOn === null) ? 'Otwórz próbę' : 'Edytuj otwarcie'}</button>
                  {(openedOn !== null) && <button className="btn btn-dark" onClick={(e) => {setDialogDateSelector(closedOn !== null ? closedOn : (new Date())); document.getElementById('open_closetrial_modal')?.click();}} disabled={buttonlock}>{(closedOn === null) ? 'Zamknij próbę' : 'Edytuj zamknięcie'}</button>}
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="p-4"></div>
      <div className="row justify-content-center firstrun-shadow">
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
                      {
                        attachments.map((attachment) => {
                          return <div className="col" id="attachment7">
                            <div className="card shadow-sm attachment" onClick={(e) => {if(!(e.target instanceof HTMLButtonElement)){window.open(process.env.REACT_APP_API_URL + '/trial/attachments/download/' + attachment.id)}}}>
                              {attachment.img}
                              <div className="card-body">
                                <p className="card-text">{attachment.name + '.' + attachment.extension} ({Math.floor(attachment.size/1024) > 0 ? (Math.floor(attachment.size/(1024*1024)) > 0 ? ((attachment.size/(1024*1024)).toFixed(1) + ' MB') : ((attachment.size/1024).toFixed(1) + ' kB')) : attachment.size+' B'})</p>
                                <div className="d-flex justify-content-between align-items-center">
                                  <small className="text-muted">{attachment.created_at.getDate() + '.' + ((attachment.created_at.getMonth() + 1) >= 10 ? (attachment.created_at.getMonth() + 1) : '0' + (attachment.created_at.getMonth() + 1)) + '.' + attachment.created_at.getFullYear() + ' ' + attachment.created_at.getHours() + ':' + (attachment.created_at.getMinutes() >= 10 ? attachment.created_at.getMinutes() : '0' + attachment.created_at.getMinutes())}</small>
                                </div>
                              </div>
                            </div>
                          </div>;
                        })
                      }
                      {/*<div className="col" id="attachment_new">
                        <div className="card attachment" data-bs-toggle="modal" data-bs-target="#new_attachment">
                          <svg className="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" role="img" preserveAspectRatio="xMidYMid slice" focusable="false">
                            <rect width="100%" height="100%" fill="#55595c"></rect>
                            <text x="50%" y="80%" fill="#eceeef" dy=".3em">Dodaj nowy załącznik</text>
                            <g>
                              <svg fill="#eceeef" x="0" y="15%" xmlns="http://www.w3.org/2000/svg" width="auto" height="50%" className="bi bi-file-earmark-plus" viewBox="0 0 16 16">
                                <path d="M8 6.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V11a.5.5 0 0 1-1 0V9.5H6a.5.5 0 0 1 0-1h1.5V7a.5.5 0 0 1 .5-.5z"></path>
                                <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"></path>
                              </svg>
                            </g>
                          </svg>
                        </div>
                      </div>*/}
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
                <p>Funkcjonalność jeszcze nie została zaimplementowana.</p>
                {/*<div className="table-responsive-sm">
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
                </div>*/}
              </li>
            </ul>
          </div>
        </div>
      </div>
      <button type="button" className="btn" id="open_opentrial_modal" data-bs-toggle="modal" data-bs-target="#opentrial_modal" style={{display: 'none'}}></button>
      <button type="button" className="btn" id="close_opentrial_modal" data-bs-dismiss="modal" data-bs-target="#opentrial_modal" style={{display: 'none'}}></button>
      <div className="modal fade" id="opentrial_modal" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Otwórz próbę</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {openedOn === null ? <>
                <p>Otwórz z datą: </p>
              </> : <>
                <p>Zmień datę: </p>
              </>}
              <select className="form-control" value={dateToString(dialogDateSelector)} onChange={(e) => setDialogDateSelector(stringToDate(e.target.value))}>
                {
                  selectableDates.map((date) => {
                    return <option value={dateToString(date)}>{date !== null ? dateToString(date) : "Anuluj otwarcie próby"}</option>
                  })
                }
              </select>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-light" data-bs-dismiss="modal">Anuluj</button>
              <button type="button" className="btn btn-danger" onClick={(e) => {onOpenCloseAttempt('open', dialogDateSelector)}} disabled={buttonlock}>Zapisz</button>
            </div>
          </div>
        </div>
      </div>
      <button type="button" className="btn" id="open_closetrial_modal" data-bs-toggle="modal" data-bs-target="#closetrial_modal" style={{display: 'none'}}></button>
      <button type="button" className="btn" id="close_closetrial_modal" data-bs-dismiss="modal" data-bs-target="#closetrial_modal" style={{display: 'none'}}></button>
      <div className="modal fade" id="closetrial_modal" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Zamknij próbę</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {closedOn === null ? <>
                <p>Zamknij z datą: </p>
              </> : <>
                <p>Zmień datę: </p>
              </>}
              <select className="form-control" value={dateToString(dialogDateSelector)} onChange={(e) => setDialogDateSelector(stringToDate(e.target.value))}>
                {
                  selectableDates.map((date) => {
                    return <option value={dateToString(date)}>{date !== null ? dateToString(date) : "Anuluj otwarcie próby"}</option>
                  })
                }
              </select>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-light" data-bs-dismiss="modal">Anuluj</button>
              <button type="button" className="btn btn-danger" onClick={(e) => {onOpenCloseAttempt('close', dialogDateSelector)}} disabled={buttonlock}>Zapisz</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </>);
}

function getBase64(file: File) {
  var fileReader = new FileReader();
  if (file) {
      fileReader.readAsDataURL(file);
  }
  return new Promise<string | ArrayBuffer | null>((resolve, reject) => {
    fileReader.onload = function(event) {
      resolve(fileReader.result);
    };
  })
}

const months = [
  "stycznia",
  "lutego",
  "marca",
  "kwietnia",
  "maja",
  "czerwca",
  "lipca",
  "sierpnia",
  "września",
  "października",
  "listopada",
  "grudnia",
];

function dateToString(predicted: Date|null) : string {
  if(predicted === null) return "null";
  return predicted.getDate() + " " + months[predicted.getMonth()] + " " + predicted.getFullYear();
}

function stringToDate(predicted: string) : Date|null {
  if(predicted === "null") return null;
  const split = predicted.split(" ");
  console.log(split[2] + "-" + (months.findIndex((v, i, a) => { return v === split[1] })+1) + "-" + split[0]);
  return new Date(split[2] + "-" + (months.findIndex((v, i, a) => { return v === split[1] })+1) + "-" + split[0]);
}

export default ShowTrial;
