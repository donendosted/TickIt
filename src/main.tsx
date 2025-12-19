import {createRoot} from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css"

import App from "./pages/index2";
import Auth from "./pages/auth/auth.tsx";
import BaseLayout from "./layouts/base-layout.tsx"

createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
        <Routes>
            <Route element={<BaseLayout />}>
                <Route index element={<App />} />
                <Route path='/login' element={<Auth />} />
            </Route>
        </Routes>
    </BrowserRouter>,
)
