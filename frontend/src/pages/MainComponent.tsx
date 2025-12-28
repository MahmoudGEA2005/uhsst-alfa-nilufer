import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import Map from '../components/Map/Map';
import TaskNav from '../components/TaskNav/TaskNav';
import { Menu } from 'lucide-react';
import "./MainComponent.css";


const MainComponent = () => {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const navRef = useRef<HTMLDivElement>(null);

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

    // Handle click outside to close nav
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(event.target as Node)) {
                const menuButton = document.querySelector('.menu-toggle-btn');
                if (menuButton && !menuButton.contains(event.target as Node)) {
                    setIsNavOpen(false);
                }
            }
        };

        if (isNavOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isNavOpen]);

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
      {/* Hamburger Menu Button */}
      <button 
        className='menu-toggle-btn'
        onClick={() => setIsNavOpen(!isNavOpen)}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          background: 'linear-gradient(180deg, #1a3d2e 0%, #0d1f19 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          cursor: 'pointer',
          transition: 'all 0.3s',
          zIndex: 100000,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(180deg, #22503d 0%, #122621 100%)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(180deg, #1a3d2e 0%, #0d1f19 100%)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <Menu size={24} />
      </button>
      
      <Map /> 
      <TaskNav isOpen={isNavOpen} navRef={navRef} />
    </div>
  );
};

export default MainComponent;
