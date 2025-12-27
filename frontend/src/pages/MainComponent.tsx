import axios from 'axios';
import { useEffect } from 'react';
import MapComponent from '../MapComponent/MapComponent';

const MainComponent = () => {

    const fetchData = async () => {
        try {
            const endpoint = `${import.meta.env.VITE_BACKEND_URL}/drivers`;
            console.log("SENDING TO ", endpoint);
            const response = await axios.get(endpoint);
            console.log("API Response:", response.data);
        }
        catch (error) {
            console.error("Error fetching data:", error);
        }
    };

  return (
    // <div style={{
    //   display: 'flex',
    //   alignItems: 'center',
    //   justifyContent: 'center',
    //   height: '100vh',
    //   fontSize: '2rem',
    //   color: 'var(--solid-color)',
    //   background: 'var(--netural-color)'
    // }}>
    //     Testing COntext
    //   <button onClick={fetchData}>FETCH</button>
    // </div>
    <div>
        <MapComponent />
    </div>
  );
};

export default MainComponent;
