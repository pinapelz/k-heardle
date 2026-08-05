import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { LandingPage } from "./pages/LandingPage";
import { DailyPage } from "./pages/DailyPage";
import { UnlimitedPage } from "./pages/UnlimitedPage";
import { MVPage } from "./pages/MVPage";
import { GroupStatsPage } from "./pages/GroupStatsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/daily" element={<DailyPage />} />
        <Route path="/mv" element={<MVPage />} />
        <Route path="/unlimited" element={<UnlimitedPage />} />
        <Route path="/stats/:groupName" element={<GroupStatsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
