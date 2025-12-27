import axios from 'axios';
import { useEffect } from 'react';
import Map from '../components/Map/Map';
import TaskNav from '../components/TaskNav/TaskNav';
import { Menu } from 'lucide-react';
import "./MainComponent.css";


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
    <div className="main-component">
      <button className='menu-btn'>
              <Menu size={24} />
            </button>
      <Map /> 
      <TaskNav />
    </div>
  );
};

export default MainComponent;
