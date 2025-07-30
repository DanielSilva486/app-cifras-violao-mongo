import { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { HomePage } from "./components/HomePage";
import { CifraViewer } from "./components/CifraViewer";
import { CifraEditor } from "./components/CifraEditor";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cifra/:id" element={<CifraViewer />} />
          <Route path="/editor" element={<CifraEditor />} />
          <Route path="/editor/:id" element={<CifraEditor />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;