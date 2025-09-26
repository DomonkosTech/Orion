import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import IsLoggedIn from "./IsLoggedIn.tsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={
                    <IsLoggedIn>
                        <HomePage />
                    </IsLoggedIn>
                    }
                />
                <Route path="/login" element={<LoginPage />} />
            </Routes>
        </Router>
    );
}

export default App;
