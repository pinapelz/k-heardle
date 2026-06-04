import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { LandingPage } from "./pages/LandingPage";
import { DailyPage } from "./pages/DailyPage";
import { UnlimitedPage } from "./pages/UnlimitedPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/daily" element={<DailyPage />} />
        <Route path="/unlimited" element={<UnlimitedPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
