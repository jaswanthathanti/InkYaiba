import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import JoinPage from './pages/JoinPage';
import WhiteboardPage from './pages/WhiteboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/board" element={<WhiteboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}
