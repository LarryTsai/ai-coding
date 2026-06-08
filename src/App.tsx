import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { WorkItemDetailPage } from './pages/WorkItemDetailPage';
import { RunDetailPage } from './pages/RunDetailPage';

function App() {
  useEffect(() => {
    // Initialize dark mode from localStorage
    const savedTheme = localStorage.getItem('dashboard-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/work-items/:id" element={<WorkItemDetailPage />} />
        <Route path="/runs/:id" element={<RunDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;
