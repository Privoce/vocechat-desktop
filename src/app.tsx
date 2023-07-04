import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { HashRouter, Route, Routes } from "react-router-dom";
import { ipcRenderer } from "electron";
import Layout from "@/components/layout";
import { initializeServers } from "./app/slices/data";
import AddViewModal from "./components/add-view-modal";
import { isDarkMode } from "./utils";

// dark mode
if (isDarkMode()) {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}
function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    const initData = async () => {
      const servers = await ipcRenderer.invoke("init-views");
      console.log("servers", servers);
      dispatch(initializeServers(servers));
    };
    initData();
  }, []);

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
