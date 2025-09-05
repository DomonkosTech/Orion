import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.tsx";
import PageDomonkos from "./pages/PageDomonkos";
import PagePeti from "./pages/PagePeti";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/domonkos" element={<PageDomonkos />} />
                <Route path="/peti" element={<PagePeti />} />
            </Routes>
        </Router>
    );
}

export default App;
