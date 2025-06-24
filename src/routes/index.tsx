import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import About from "../pages/About";
import BasicMath from "../pages/BasicMath";
import Multiplication from "../pages/Multiplication";
import LunaSpeech from "../pages/LunaSpeech";
import LunaNarrative2 from "../pages/LunaNarrative2";
import LunaChat from "../pages/LunaChat";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      { path: "basicmath", element: <BasicMath /> }, 
      { path: "multiplication", element: <Multiplication /> }, 
      { path: "lunaspeech", element: <LunaSpeech /> }, 
      { path: "lunanarrative", element: <LunaNarrative2 /> }, 
      { path: "lunachat", element: <LunaChat /> }, 
    ]
  }
]);
