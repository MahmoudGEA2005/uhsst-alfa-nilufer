import axios from 'axios';
import Cookies from 'js-cookie';
import { useEffect, useState, useRef } from 'react';
import Map from '../components/Map/Map';
import TaskNav from '../components/TaskNav/TaskNav';
import { Menu } from 'lucide-react';
import "./MainComponent.css";

interface Route {
  id: number;
  driver_id: number;
  route_data: {
    Arac: string;
    Tip: string;
    Ozet: {
      Cop_kg: number;
      Durak_Sayisi: number;
      Mesafe_km: number;
      Kapasite_Kullanim: string;
    };
    Rota: Array<{
      Sira: number;
      Mahalle: string;
      Koordinat: {
        Lat: number;
        Lng: number;
      };
      Cop_kg: number;
      Mesafe_km: number;
    }>;
  };
  waypoints: Array<{
    lat: number;
    lng: number;
  }>;
  created_at?: string;
}

const MainComponent = () => {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [route, setRoute] = useState<Route | null>(null);
    const [loading, setLoading] = useState(true);
    const navRef = useRef<HTMLDivElement | null>(null);

    // Driver ve route bilgilerini yükle
    useEffect(() => {
        const fetchDriverAndRoute = async () => {
            try {
                const token = Cookies.get('driver_token');
                if (!token) {
                    setLoading(false);
                    return;
                }

                // Driver bilgisini al
                const driverResponse = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/drivers/auth/check`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json',
                        },
                    }
                );

                if (driverResponse.data?.driver) {
                    const driverData = driverResponse.data.driver;

                    // Bu sürücünün rotasını çek (bugünkü en son rota)
                    try {
                        const routeResponse = await axios.get(
                            `${import.meta.env.VITE_BACKEND_URL}/routes/driver/${driverData.id}`,
                            {
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Accept': 'application/json',
                                },
                            }
                        );

                        if (routeResponse.data?.data && routeResponse.data.data.length > 0) {
                            // Bugünkü en son rotayı al
                            const today = new Date().toISOString().split('T')[0];
                            const todayRoutes = routeResponse.data.data.filter((r: Route) => {
                                const routeDate = new Date(r.created_at || '').toISOString().split('T')[0];
                                return routeDate === today;
                            });

                            if (todayRoutes.length > 0) {
                                // En son oluşturulan rotayı al
                                const latestRoute = todayRoutes.sort((a: Route, b: Route) => 
                                    new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
                                )[0];
                                setRoute(latestRoute);
                            } else {
                                // Bugünkü rota yoksa en son rotayı al
                                const latestRoute = routeResponse.data.data.sort((a: Route, b: Route) => 
                                    new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
                                )[0];
                                setRoute(latestRoute);
                            }
                        }
                    } catch (routeError) {
                        console.error('Error fetching route:', routeError);
                    }
                }
            } catch (error) {
                console.error('Error fetching driver data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDriverAndRoute();
    }, []);

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

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                background: 'var(--netural-color)',
                color: 'var(--solid-color)',
            }}>
                Yükleniyor...
            </div>
        );
    }

    return (
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
            
            <Map route={route} />
            <TaskNav isOpen={isNavOpen} navRef={navRef} route={route} />
        </div>
    );
};

export default MainComponent;
