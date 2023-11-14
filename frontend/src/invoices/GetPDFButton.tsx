
interface Props {
  numer: string;
  token: string;
}

function GetPDFButton({ numer, token }: Props): JSX.Element {

  const downloadPDF = async () => {
    const requestOptions : RequestInit = {
      method: 'GET',
      mode: 'cors',
      headers: {
        'x-access-token': token
      }
    };
    const response = await fetch(process.env.REACT_APP_API_URL + '/invoices/pdf/' + encodeURIComponent(numer), requestOptions);
    const body = await response.blob();

    if (response.status !== 200) {
      throw Error(response.status + ': ' + response.statusText);
    }

    const url = window.URL.createObjectURL(
      new Blob([body]),
    );

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      numer + '.pdf',
    );

    // Append to html link element page
    document.body.appendChild(link);

    // Start download
    link.click();

    // Clean up and remove the link
    (link.parentNode as ParentNode).removeChild(link);
  };

  return (
    <button type="button" className="btn btn-dark btn-sm" onClick={downloadPDF}>
      Pobierz PDF
    </button>
  );
}

export default GetPDFButton;
