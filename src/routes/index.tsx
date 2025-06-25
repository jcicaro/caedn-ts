import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";

import About from "../pages/About";

import JcProgrammingCheatsheet from "../pages/JcProgrammingCheatsheet";

import BasicMath from "../pages/BasicMath2";
import Multiplication from "../pages/Multiplication2";
import LunaSpeech2 from "../pages/LunaSpeech2";
import LunaNarrative2 from "../pages/LunaNarrative2";
import LunaChat from "../pages/LunaChat";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },

      { path: "about", element: <About /> },

      { path: "jcprogrammingcheatsheet", element: <JcProgrammingCheatsheet /> }, 

      { path: "basicmath", element: <BasicMath /> }, 
      { path: "multiplication", element: <Multiplication /> }, 
      { path: "lunaspeech", element: <LunaSpeech2 /> }, 
      { path: "lunanarrative", element: <LunaNarrative2 /> }, 
      { path: "lunachat", element: <LunaChat /> }, 
    ]
  }
]);
