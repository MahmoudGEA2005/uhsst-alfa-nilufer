import React from 'react';
import "./TaskNav.css";
import WorkerUser from '../WorkerUser/WorkerUser';
import StatCard from '../StatCard/StatCard';
import StopCard from '../StopCard/StopCard';
import { Menu, CheckCircle, Clock, Settings, ChevronRight, LogOut } from 'lucide-react';

const TaskNav = () => {
  const handleLogout = () => {
    document.cookie = "driver_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.reload();
  };
  const stops = [
    {
      number: 1,
      address: "280 Pine St",
      info: "Current Target • Residential",
      badges: ["2 Bins", "Right Side"],
      isActive: true
    },
    {
      number: 2,
      address: "312 Oak Ave",
      info: "0.4 mi • Commercial"
    },
    {
      number: 3,
      address: "405 Maple Dr",
      info: "0.8 mi • Residential"
    },
    {
      number: 4,
      address: "12 Highland Park",
      info: "1.2 mi • Large Item Pickup"
    }
  ];

  return (
    <div className='task-nav'>
      
      
      <WorkerUser />
      
      <div className='stats-container'>
        <StatCard 
          icon={CheckCircle}
          label="Completed"
          value={42}
          subValue="/85"
        />
        <StatCard 
          icon={Clock}
          label="Est. Finish"
          value="2:30"
          subValue="PM"
        />
      </div>
      
      <div className='stops-section'>
        <h3 className='section-title'>UPCOMING STOPS</h3>
        
        <div className='stops-list'>
          {stops.map((stop) => (
            <StopCard 
              key={stop.number}
              number={stop.number}
              address={stop.address}
              info={stop.info}
              badges={stop.badges}
              isActive={stop.isActive}
            />
          ))}
        </div>
      </div>
      
      <button className='settings-btn'>
        <Settings size={24} />
        <span>Route Settings</span>
        <ChevronRight size={20} />
      </button>
      
      <button className='settings-btn' onClick={handleLogout} style={{ marginTop: '8px', backgroundColor: '#dc2626' }}>
        <LogOut size={24} />
        <span>Logout</span>
      </button>
    </div>
  )
}

export default TaskNav