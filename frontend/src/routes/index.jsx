import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DriverRegister from '../pages/delivery/Register';
import DriverDashboard from '../pages/delivery/Dashboard';

<BrowserRouter>
  <Routes>
    <Route path="/driver/register" element={<DriverRegister />} />
    <Route path="/driver/dashboard" element={<DriverDashboard />} />
  </Routes>
</BrowserRouter>
