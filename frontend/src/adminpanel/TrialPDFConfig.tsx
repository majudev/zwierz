import React, {useState, useEffect} from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { TrialType, CommiteeRole, Rank, SSOManager, SystemMode } from '../types';
import 'bootstrap/js/src/modal';
import { toHaveFormValues } from '@testing-library/jest-dom/matchers';

interface Props {
  mode: SystemMode;
}

function TrialPDFConfig({mode}: Props): JSX.Element {
  const uploadHardLimit = 2 * 1024 * 1024;

  const [maxFileSize, setMaxFileSize] = useState(-1);

  const [image, setImage] = useState<JSX.Element>(<div className="spinner-border" role="status"><span className="visually-hidden">Ładowanie...</span></div>);
  const [newImage, setNewImage] = useState<File | null>(null);

  const [buttonlock, setButtonlock] = useState(false);
  const [uploadReady, setUploadReady] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [hoName, setHOName] = useState('');
  const [hrName, setHRName] = useState('');
  const [editmodeHO, setEditmodeHO] = useState(false);
  const [editmodeHR, setEditmodeHR] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    refreshImage();
    refreshMaxUploadSize();
    refreshName("ho");
    refreshName("hr");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if(body.data < uploadHardLimit) setMaxFileSize(body.data);
    else setMaxFileSize(uploadHardLimit);
  }

  const refreshImage = async function(){
    setButtonlock(true);
    fetch(process.env.REACT_APP_API_URL + "/administrative/pdf/image", {
      method: "GET",
      mode: 'same-origin',
    }).then(async (img) => {
      if(img.ok){
        const base64 = URL.createObjectURL(await img.blob());
        setImage(<img src={base64} height="225"></img>);
        setButtonlock(false);
        return;
      }else setImage(<>Nie można załadować obrazka.</>);
    }).catch((reason) => {
      setImage(<>Nie można załadować obrazka.</>);
    });
  }

  const onUpdateAttempt = async function(){
    setButtonlock(true);

    if(newImage === null){
      setUploadError('Musisz wybrać jakiś plik');
      setButtonlock(false);
      return;
    }

    const base64contents = await getBase64(newImage);
    if(base64contents === null){
      setUploadError('Nie udało się zakodować pliku w base64');
      setButtonlock(false);
      return;
    }

    const response = await fetch(process.env.REACT_APP_API_URL + "/administrative/pdf/image", {
      method: 'PATCH',
      mode: 'same-origin',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: (base64contents as string).split(',')[1],
        extension: newImage.name.split('.').pop(),
      })
    });
    if(!response.ok){
      setButtonlock(false);
      const body = await response.json();
      setUploadError('Nie udało się dodać załącznika: ' + body.message);
      return;
    }
    await refreshImage();
    setButtonlock(false);
  };

  const onResetAttempt = async function(){
    setButtonlock(true);

    const response = await fetch(process.env.REACT_APP_API_URL + "/administrative/pdf/image", {
      method: 'DELETE',
      mode: 'same-origin',
    });
    if(!response.ok){
      setButtonlock(false);
      const body = await response.json();
      setUploadError('Nie udało się przywrócić domyślnego obrazka: ' + body.message);
      return;
    }
    await refreshImage();
    setButtonlock(false);
  };

  const refreshName = async function(type: "ho"|"hr"){
    setButtonlock(true);
    const response = await fetch(process.env.REACT_APP_API_URL + "/administrative/pdf/name/" + type, {
      method: "GET",
      mode: 'same-origin',
    });
    if(!response.ok){
      alert('Cannot fetch PDF names');
      setButtonlock(false);
      return;
    }
    const body = await response.json();
    if(type === "ho") setHOName(body.data);
    else if(type === "hr") setHRName(body.data);
    setButtonlock(false);
  }

  const onUpdateNameAttempt = async function(type: "ho"|"hr", name: string){
    setButtonlock(true);
    const response = await fetch(process.env.REACT_APP_API_URL + "/administrative/pdf/name/" + type, {
      method: "PATCH",
      mode: 'same-origin',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
      })
    });
    if(!response.ok){
      alert('Cannot update PDF names');
      setButtonlock(false);
      return;
    }
    if(type === "ho"){
      setEditmodeHO(false);
    }else if(type === "hr"){
      setEditmodeHR(false);
    }
    await refreshName(type);
    setButtonlock(false);
  }

  return (<>
    <div className="col-lg-6 col-sm-12">
      <div className="p-3">
        <ul className="list-group">
          <li className="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
            <h4 className="mb-1 mt-1">Generowanie PDF próby</h4>
          </li>
          <li className="list-group-item text-center">
            {image}
          </li>
          <li className="list-group-item">
            <input type="file" accept=".jpg, .png, .jpeg, .gif, .bmp" className="form-control" onChange={(e) => {setUploadReady(e.target.files !== null); if(e.target.files){ setNewImage(e.target.files[0]); if(e.target.files[0].size > maxFileSize){ setUploadReady(false); } }}} disabled={buttonlock}/>
            <p>Maksymalny rozmiar pliku: {Math.floor(maxFileSize/1024) > 0 ? (Math.floor(maxFileSize/(1024*1024)) > 0 ? (maxFileSize/(1024*1024)).toFixed(1) + ' MB' : (maxFileSize/1024).toFixed(1) + ' kB') : maxFileSize+' B'}</p>
            { newImage && <p className={newImage.size <= maxFileSize ? "text-success mb-0" : "text-danger mb-0"}>
              Rozmiar: {Math.floor(newImage.size/1024) > 0 ? (Math.floor(newImage.size/(1024*1024)) > 0 ? ((newImage.size/(1024*1024)).toFixed(1) + ' MB') : ((newImage.size/1024).toFixed(1) + ' kB')) : newImage.size+' B'}
            </p>}
            {uploadError !== '' && <p className="pt-2 text-danger">{uploadError}</p>}
            <button className="btn btn-dark" onClick={(e) => onUpdateAttempt()} disabled={buttonlock || !uploadReady}>Zaktualizuj obrazek</button>
            <button className="btn btn-danger" onClick={(e) => onResetAttempt()} disabled={buttonlock}>Przywróć domyślny obrazek</button>
          </li>
          {(mode === SystemMode.HO || mode === SystemMode.HO_HR) && <li className="list-group-item" style={{whiteSpace: "pre-wrap"}}>
            <b>Nazwa kapituły {mode === SystemMode.HO_HR ? 'HO' : ''}:</b>
            {!editmodeHO ?
              <> {hoName}</>
            :
              <textarea className="form-control" value={hoName} onChange={(e) => setHOName(e.target.value)} disabled={buttonlock}></textarea>
            }
            <br/>
            {!editmodeHO ?
              <button className="btn btn-dark" onClick={(e) => setEditmodeHO(true)} disabled={buttonlock}>Edytuj</button>
            :
              <button className="btn btn-success" onClick={(e) => onUpdateNameAttempt("ho", hoName)} disabled={buttonlock}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-lg" viewBox="0 0 16 16"><path d="M13.485 1.431a1.473 1.473 0 0 1 2.104 2.062l-7.84 9.801a1.473 1.473 0 0 1-2.12.04L.431 8.138a1.473 1.473 0 0 1 2.084-2.083l4.111 4.112 6.82-8.69a.486.486 0 0 1 .04-.045z"></path></svg></button>
            }
          </li>}
          {(mode === SystemMode.HR || mode === SystemMode.HO_HR) && <li className="list-group-item" style={{whiteSpace: "pre-wrap"}}>
            <b>Nazwa kapituły {mode === SystemMode.HO_HR ? 'HR' : ''}:</b>
            {!editmodeHR ?
              <> {hrName}</>
            :
              <textarea className="form-control" value={hrName} onChange={(e) => setHRName(e.target.value)} disabled={buttonlock}></textarea>
            }
            <br/>
            {!editmodeHR ?
              <button className="btn btn-dark" onClick={(e) => setEditmodeHR(true)} disabled={buttonlock}>Edytuj</button>
            :
              <button className="btn btn-success" onClick={(e) => onUpdateNameAttempt("hr", hrName)} disabled={buttonlock}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-lg" viewBox="0 0 16 16"><path d="M13.485 1.431a1.473 1.473 0 0 1 2.104 2.062l-7.84 9.801a1.473 1.473 0 0 1-2.12.04L.431 8.138a1.473 1.473 0 0 1 2.084-2.083l4.111 4.112 6.82-8.69a.486.486 0 0 1 .04-.045z"></path></svg></button>
            }
          </li>}
        </ul>
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

export default TrialPDFConfig;
