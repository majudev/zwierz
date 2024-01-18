import React, {useState, useEffect} from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { TrialType, CommiteeRole, Rank, SSOManager, SystemMode } from '../types';
import 'bootstrap/js/src/modal';

function ReportTutorialConfig(): JSX.Element {
  const [showReportTutorial, setShowReportTutorial] = useState(false);

  const [maxFileSize, setMaxFileSize] = useState(-1);

  const [newImage, setNewImage] = useState<File | null>(null);

  const [buttonlock, setButtonlock] = useState(false);
  const [uploadReady, setUploadReady] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    refreshReportTutorial();
    refreshMaxUploadSize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshReportTutorial = async function(){
    setButtonlock(true);
    const response = await fetch(process.env.REACT_APP_API_URL + "/administrative/reporttutorial/show", {
      method: "GET",
      mode: 'same-origin',
    });
    if(!response.ok){
      alert('Cannot fetch showreporttutorial');
      setButtonlock(false);
      return;
    }
    const body = await response.json();
    setShowReportTutorial(body.data);
    setButtonlock(false);
  }

  const onUpdateReportTutorialAttempt = async function(state: boolean){
    setButtonlock(true);
    const response = await fetch(process.env.REACT_APP_API_URL + "/administrative/reporttutorial/show/" + (state ? 'true' : 'false'), {
      method: "PATCH",
      mode: 'same-origin',
    });
    if(!response.ok){
      alert('Cannot update showtrialtutorial');
      setButtonlock(false);
      return;
    }
    await refreshReportTutorial();
    setButtonlock(false);
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

    const response = await fetch(process.env.REACT_APP_API_URL + "/administrative/reporttutorial/image", {
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
    setButtonlock(false);
  };

  return (<>
    <div className="col-lg-4 col-sm-12">
      <div className="p-3">
        <ul className="list-group">
          <li className="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
            <h4 className="mb-1 mt-1">Instrukcja tworzenia raportu</h4>
          </li>
          <li className="list-group-item text-center">
            <button className="btn btn-dark" onClick={(e) => {window.open(process.env.REACT_APP_API_URL + "/administrative/reporttutorial/image", '_blank')}} disabled={buttonlock || !showReportTutorial}>Zobacz instrukcję w nowym oknie</button>
          </li>
          <li className="list-group-item">
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" id="showReportTutorial" checked={showReportTutorial} onChange={(e) => {onUpdateReportTutorialAttempt(e.target.checked);}}></input>
              <label className="form-check-label" htmlFor="showReportTutorial">
                Wyświetlaj kartę "Jak stworzyć raport" na górnym pasku
              </label>
            </div>
          </li>
          <li className="list-group-item">
            <p>Jeśli włączyłeś wyświetlanie karty na górnym pasku, musisz też wysłać na serwer grafikę która ma być wyświetlana.</p>
            <input type="file" accept=".jpg, .png, .jpeg, .gif, .bmp" className="form-control" onChange={(e) => {setUploadReady(e.target.files !== null); if(e.target.files){ setNewImage(e.target.files[0]); if(e.target.files[0].size > maxFileSize){ setUploadReady(false); } }}} disabled={buttonlock || !showReportTutorial}/>
            <p>Maksymalny rozmiar pliku: {Math.floor(maxFileSize/1024) > 0 ? (Math.floor(maxFileSize/(1024*1024)) > 0 ? (maxFileSize/(1024*1024)).toFixed(1) + ' MB' : (maxFileSize/1024).toFixed(1) + ' kB') : maxFileSize+' B'}</p>
            { newImage && <p className={newImage.size <= maxFileSize ? "text-success mb-0" : "text-danger mb-0"}>
              Rozmiar: {Math.floor(newImage.size/1024) > 0 ? (Math.floor(newImage.size/(1024*1024)) > 0 ? ((newImage.size/(1024*1024)).toFixed(1) + ' MB') : ((newImage.size/1024).toFixed(1) + ' kB')) : newImage.size+' B'}
            </p>}
            {uploadError !== '' && <p className="pt-2 text-danger">{uploadError}</p>}
            <button className="btn btn-dark" onClick={(e) => onUpdateAttempt()} disabled={buttonlock || !uploadReady || !showReportTutorial}>Zaktualizuj obrazek</button>
          </li>
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

export default ReportTutorialConfig;
