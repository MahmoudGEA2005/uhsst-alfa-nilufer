import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./WorkerUser.css";
import user from "../../assets/patterens/user.jpg";

interface Driver {
  id: number;
  name: string;
  photo: string | null;
  shift_number?: string;
}

const WorkerUser = () => {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);

  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        const token = getCookie('driver_token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/drivers/auth/check`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (response.data) {
          setDriver(response.data.driver);
        }
      } catch (error) {
        console.error('Error fetching driver data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDriverData();
  }, []);

  const driverPhoto = driver?.photo 
    ? `${import.meta.env.VITE_STORAGE_URL}/${driver.image}` 
    : user;

  const driverName = `${driver?.first_name} ${driver?.last_name}` || 'M. Yılmaz';
  const shiftInfo = driver?.shift_number 
    ? `VARDİYA #${driver.shift_number} • AKTİF`
    : 'VARDİYA #4000 • AKTİF';

  if (loading) {
    return (
      <div className="w-user">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-user">
        <img src={driverPhoto} alt="User" />
        <div className="w-user-info">
            <h1>{driverName}</h1>
            <div>
                {shiftInfo}
            </div>
        </div>
    </div>
  )
}

export default WorkerUser