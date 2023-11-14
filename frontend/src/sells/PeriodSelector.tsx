import React, { useState, useEffect } from 'react';

interface PeriodSelectorProps {
  onPeriodSelected: (period: string) => void;
  token: string;
}

function PeriodSelector({onPeriodSelected, token} : PeriodSelectorProps){
    const [periods, setPeriods] = useState<string[]>([]);
    const [selected, setSelected] = useState('');

    const callBackendAPI = async () => {
        const response = await fetch(
          process.env.REACT_APP_API_URL + '/sells/periods',
          {
            mode: 'cors',
            headers: {
              'x-access-token': token
            },
          }
        );
        const body = await response.json();
    
        if (response.status !== 200) {
          throw Error(body.message) 
        }
        return body;
    };

    useEffect(() => {
        callBackendAPI()
        .then(res => {
          setPeriods(res);
          if(selected === ''){
            const first = res[0];
            setSelected(first);
            onPeriodSelected(first);
          }
        }).catch(err => console.log(err));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleClick = (event : React.MouseEvent<HTMLButtonElement>) => {
        const target = (event.currentTarget as HTMLElement);
        if(target.getAttribute('data-example') !== null){
            const name = (target.getAttribute('data-example') as string);
            setSelected(name);
            onPeriodSelected(name);
        }
    };

  return (
    <ul className="pagination mt-2">
        {periods.map((value, index) => (
            <li className={selected === value ? "page-item active" : "page-item"}><button className="page-link" onClick={handleClick} data-example={value}>{value.split('-')[1] + '.' + value.split('-')[0]}</button></li>
        ))}
    </ul>
  );
};

export default PeriodSelector;
