
import { Navigate } from 'react-router-dom';

export default function DriverProtectedRoute({ children }) {
  const driverId = localStorage.getItem('driverId');
  
  if (!driverId) {
    return <Navigate to="/driverLogin" replace />; // go to driver login page
  }

  return children;
}
