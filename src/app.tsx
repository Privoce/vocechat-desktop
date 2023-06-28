// import { useState } from 'react'
import { HashRouter, Route, Routes } from "react-router-dom";
import Layout from "@/components/layout";
import AddViewModal from "./components/add-view-modal";
import { isDarkMode } from "./utils";

// dark mode
if (isDarkMode()) {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}
function App() {
  // const [count, setCount] = useState(0)
  return (
    <HashRouter>
      <Routes>
        <Route path="/add-view-modal" element={<AddViewModal />}></Route>
        <Route path="/" element={<Layout />}></Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
