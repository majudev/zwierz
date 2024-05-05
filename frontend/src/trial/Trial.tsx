import React, {useState, useEffect} from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { TrialType, CommiteeRole, Rank, SSOManager } from '../types';
import { predictedDateToString, stringToPredictedDate, verifyPhone } from '../utils';
import 'bootstrap/js/src/modal';
import FullscreenSpinner from '../components/FullscreenSpinner';

interface Props {
  loggedIn: boolean;
  logOut: () => void;
  logIn: () => void;
  type: TrialType;
}

function Trial({ type }: Props): JSX.Element {
  const [ready, setReady] = useState(false);

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

  const [showCategoryHints, setShowCategoryHints] = useState(false);

  const [maxFileSize, setMaxFileSize] = useState(-1);
  const [newAttachmentFile, setNewAttachmentFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [newAttachmentName, setNewAttachmentName] = useState('');
  const [newAttachmentButtonlock, setNewAttachmentButtonlock] = useState(false);

  const [attachments, setAttachments] = useState<Array<{id: number; name: string; extension: string; created_at: Date, thumbnail: string | null; size: number, img: JSX.Element}>>([]);

  const navigate = useNavigate();

  useEffect(() => {
    setReady(false);

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

    setNewQuestContent('');
    setNewQuestFinishDate(new Date());
    setNewQuestVisible(false);
    setNewQuestButtonLock(false);
    setQuests([]);

    setNewAttachmentFile(null);
    setUploadError('');
    setNewAttachmentName('');
    setNewAttachmentButtonlock(false);
    
    refreshTrialData();
    refreshMaxUploadSize();

    var dates = Array<Date>();
    for(var i = 0; i < 14; ++i){
      const now = (openedOn !== null) ? openedOn : new Date();
      const entry = new Date(now.setMonth(now.getMonth() + i));
      dates.push(entry);
    }
    setSelectableDates(dates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  useEffect(() => {
    refreshShowCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshShowCategories = async function(flushCache: boolean = false) {
    const response = await fetch(process.env.REACT_APP_API_URL + "/static/show-category-hints", {
      method: "GET",
      cache: flushCache ? "reload" : undefined,
      mode: 'same-origin'
    });
    if(!response.ok){
      alert('Cannot fetch hint details');
      return;
    }
    const body = await response.json();
    setShowCategoryHints(body.data);
  }

  const refreshMaxUploadSize = async function(){
    const response = await fetch(process.env.REACT_APP_API_URL + "/static/max-upload-size", {
      method: "GET",
      mode: 'same-origin',
    });
    if(!response.ok){
      alert('Cannot obtain max upload size. File uploads disabled.');
      return;
    }
    const body = await response.json();
    setMaxFileSize(body.data);
  }

  const refreshTrialData = async function(){
    const response = await fetch(process.env.REACT_APP_API_URL + "/trial/me/" + type.toLowerCase(), {
      method: "GET",
      mode: 'same-origin',
    });
    if(!response.ok){
      if(response.status === 404){
        setReady(true);
        setInitMode(true);
        setEditmode(true);
        return;
      }else{
        alert('Cannot fetch trial details');
        return;
      }
    }
    setReady(true);

    refreshQuests();
    refreshAttachmentsList();
    
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

  const refreshQuests = async function(){
    const response = await fetch(process.env.REACT_APP_API_URL + "/trial/quests/me/" + type.toLowerCase(), {
      method: "GET",
      mode: 'same-origin',
    });
    if(!response.ok){
      alert('Cannot fetch quests list');
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
      alert('Cannot create quest');
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
      refreshQuests();
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
      refreshQuests();
      alert('Cannot delete quest');
      return;
    }
  };

  const refreshAttachmentsList = async function(){
    const response = await fetch(process.env.REACT_APP_API_URL + "/trial/attachments/me/" + type.toLowerCase(), {
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

  const onAttachmentCreateAttempt = async function(){
    setNewAttachmentButtonlock(true);

    if(newAttachmentFile === null){
      setUploadError('Musisz wybrać jakiś plik');
      setNewAttachmentButtonlock(false);
      return;
    }

    const base64contents = await getBase64(newAttachmentFile);
    if(base64contents === null){
      setUploadError('Nie udało się zakodować pliku w base64');
      setNewAttachmentButtonlock(false);
      return;
    }

    const response = await fetch(process.env.REACT_APP_API_URL + "/trial/attachments/new/" + type.toLowerCase(), {
      method: 'POST',
      mode: 'same-origin',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newAttachmentName,
        content: (base64contents as string).split(',')[1],
        extension: newAttachmentFile.name.split('.').pop(),
      })
    });
    setNewAttachmentButtonlock(false);
    if(!response.ok){
      if(response.status === 409){
        setUploadError('Załącznik z tą nazwą już istnieje!');
        return;
      }else if(response.status === 413){
        setUploadError('Załącznik zbyt duży: ' + ((base64contents as string).split(',')[1]).length + 'B');
        console.log(newAttachmentFile.length);
        console.log(((base64contents as string).split(',')[1]).length + 'B');
        console.log((base64contents as string).split(',')[1]);
        return;
      }
      const body = await response.json();
      setUploadError('Nie udało się dodać załącznika: ' + body.message);
      return;
    }
    const body = await response.json();
    //setNewQuestVisible(false);
    refreshAttachmentsList();
    document.getElementById('close_new_attachment')?.click();
  };

  const onAttachmentDeleteAttempt = async function(id: number){
    const response = await fetch(process.env.REACT_APP_API_URL + "/trial/attachments/" + id, {
      method: 'DELETE',
      mode: 'same-origin',
      headers: {
        "Content-Type": "application/json",
      }
    });
    if(!response.ok){
      alert('Cannot remove attachment');
      return;
    }
    refreshAttachmentsList();
    
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

  return (<>
    {!ready ? <FullscreenSpinner />
    :
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
                    <tbody>
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
                        <td><textarea className="form-control longrecord" value={newQuestContent} onChange={(e) => setNewQuestContent(e.target.value)} placeholder={showCategoryHints ? 'Pamiętaj aby dopisać kategorię lub kategorie jakich dotyczy zadanie!' : ''}></textarea></td>
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
                          <button type="button" className="btn btn-dark" onClick={onQuestCreateAttempt} disabled={newQuestButtonlock}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-lg" viewBox="0 0 16 16">
                              <path d="M13.485 1.431a1.473 1.473 0 0 1 2.104 2.062l-7.84 9.801a1.473 1.473 0 0 1-2.12.04L.431 8.138a1.473 1.473 0 0 1 2.084-2.083l4.111 4.112 6.82-8.69a.486.486 0 0 1 .04-.045z"/>
                            </svg>
                          </button>
                        </td>
                      </tr>}
                    </tbody>
                  </table>
                  <div className="d-flex justify-content-end flex-row">
                    <button type="button" className="btn btn-dark" disabled={newQuestVisible || archived} onClick={() => {setNewQuestContent(''); setNewQuestFinishDate(new Date()); setNewQuestVisible(true)}}>Dodaj nowe</button>
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
              {archived && <li className="list-group-item bg-danger text-center">
                <b>Próba została zarchiwizowana. Nie możesz jej edytować.</b>
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
                      {
                        attachments.map((attachment) => {
                          return <div className="col" id="attachment7">
                            <div className="card shadow-sm attachment" onClick={(e) => {if(!(e.target instanceof HTMLButtonElement)){window.open(process.env.REACT_APP_API_URL + '/trial/attachments/download/' + attachment.id)}}}>
                              {attachment.img}
                              <div className="card-body">
                                <p className="card-text">{attachment.name + '.' + attachment.extension} ({Math.floor(attachment.size/1024) > 0 ? (Math.floor(attachment.size/(1024*1024)) > 0 ? ((attachment.size/(1024*1024)).toFixed(1) + ' MB') : ((attachment.size/1024).toFixed(1) + ' kB')) : attachment.size+' B'})</p>
                                <div className="d-flex justify-content-between align-items-center">
                                  <small className="text-muted">{attachment.created_at.getDate() + '.' + ((attachment.created_at.getMonth() + 1) >= 10 ? (attachment.created_at.getMonth() + 1) : '0' + (attachment.created_at.getMonth() + 1)) + '.' + attachment.created_at.getFullYear() + ' ' + attachment.created_at.getHours() + ':' + (attachment.created_at.getMinutes() >= 10 ? attachment.created_at.getMinutes() : '0' + attachment.created_at.getMinutes())}</small>
                                  <div className="btn-group">
                                    <button type="button" className="btn btn-sm btn-danger" onClick={(e) => onAttachmentDeleteAttempt(attachment.id)}>Usuń</button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>;
                        })
                      }
                      {!archived && <div className="col" id="attachment_new">
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
                      </div>}
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
      </div>}
    </main>}
    <div className="modal modal-lg fade" id="new_attachment">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Dodaj nowy załącznik</h5>
            <button id="close_new_attachment" type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            Podaj nazwę załącznika:
            <input type="text" className="form-control longrecord" value={newAttachmentName} onChange={(e) => {if(e.target.value.length <= 100) setNewAttachmentName(e.target.value); else setUploadError('Nazwa pliku zbyt długa (ponad 100 znaków)');}} placeholder="np. Raport z próby" />
            <input type="file" className="form-control" onChange={(e) => {if(e.target.files){ setNewAttachmentFile(e.target.files[0]); if(newAttachmentName === ''){ setNewAttachmentName(e.target.files[0].name.replace(/\.[^/.]+$/, "")) } }; }} />
            <p>Maksymalny rozmiar pliku: {Math.floor(maxFileSize/1024) > 0 ? (Math.floor(maxFileSize/(1024*1024)) > 0 ? (maxFileSize/(1024*1024)).toFixed(1) + ' MB' : (maxFileSize/1024).toFixed(1) + ' kB') : maxFileSize+' B'}</p>
            { newAttachmentFile && <p className={newAttachmentFile.size <= maxFileSize ? "text-success" : "text-danger"}>
              Rozmiar: {Math.floor(newAttachmentFile.size/1024) > 0 ? (Math.floor(newAttachmentFile.size/(1024*1024)) > 0 ? ((newAttachmentFile.size/(1024*1024)).toFixed(1) + ' MB') : ((newAttachmentFile.size/1024).toFixed(1) + ' kB')) : newAttachmentFile.size+' B'}
            </p>}
            {newAttachmentButtonlock && <p>Trwa wysyłanie... Nie zamykaj tego okna!</p>}
            {uploadError !== '' && <p id="new_attachment_error" className="pt-2 text-danger">{uploadError}</p>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-light" data-bs-dismiss="modal">Anuluj</button>
            <button type="button" className="btn btn-dark" onClick={onAttachmentCreateAttempt} disabled={newAttachmentButtonlock || newAttachmentFile === null || (newAttachmentFile.size > maxFileSize) || newAttachmentName.length > 100}>Dodaj</button>
          </div>
        </div>
      </div>
    </div>
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

export default Trial;
