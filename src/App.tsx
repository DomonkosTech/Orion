import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserHomePage from "./features/user/HomePage/UserHomePage.tsx";
import UserLoginPage from "./features/user/LoginPage/UserLoginPage.tsx";
import UserRegisterPage from "./features/user/RegisterPage/UserRegisterPage.tsx";
import IsLoggedIn from "./IsLoggedIn.tsx";
import UserEditProfile from "./features/user/EditProfile/UserEditProfile.tsx";
import CompanyRegisterPage from "./features/company/RegisterPage/CompanyRegisterPage.tsx";
import CompanyLoginPage from "./features/company/LoginPage/CompanyLoginPage.tsx";
import CompanyEditProfile from "./features/company/EditProfile/CompanyEditProfile.tsx";
import AddJob from "./features/company/CompanyJobs/AddJob.tsx";
import CompanyHomePage from "./features/company/HomePage/CompanyHomePage.tsx";
import ShowListedJobs from "./features/company/ShowListedJobs/ShowListedJobs.tsx";
import EditJob from "./features/company/CompanyJobs/EditJob.tsx";
import ListJobs from "./features/user/UserJobs/ListAllJobs/ListJobs.tsx";
import ShowJob from "./features/user/UserJobs/ShowSelectedJob/ShowJob.tsx";
import JobApplications from "./features/user/JobApplications/JobApplications.tsx";
import UploadResume from "./features/user/UploadResume/UploadResume.tsx";
import ApplicantTrackingSystem from "./features/company/CompanyJobs/ApplicantTrackingSystem.tsx";
import PublicHomePage from "./features/public/PublicHomePage/PublicHomePage.tsx";
import ShowEmployees from "./features/company/ShowEmployees/ShowEmployees.tsx";
import UserVerify from "./features/user/RegisterPage/UserVerify.tsx";
import UserSendVerify from "./features/user/RegisterPage/UserSendVerify.tsx";
import CompanyVerify from "./features/company/RegisterPage/CompanyVerify.tsx";
import CompanySendVerify from "./features/company/RegisterPage/CompanySendVerify.tsx";
import UserPasswordResetRequest from "./features/user/EditProfile/UserPasswordResetRequest.tsx";
import UserPasswordResetSave from "./features/user/EditProfile/UserPasswordResetSave.tsx";
import CompanyPasswordResetRequest from "./features/company/EditProfile/CompanyPasswordResetRequest.tsx";
import CompanyPasswordResetSave from "./features/company/EditProfile/CompanyPasswordResetSave.tsx";
import Messenger from "./features/user/messenger/messenger.tsx";
import ShowFavoritesJobs from "./features/user/UserJobs/Favorites/ShowFavoritesJobs.tsx";

function App() {
    return (
        <Router>
            <Routes>
                {/* Mindenkinek elérhető oldalak (PUBLIC) */}
                <Route path="/" element={<PublicHomePage />} />
                <Route path="/user/verify" element={<UserVerify />} />
                <Route path="/user/sendverify" element={<UserSendVerify />} />
                <Route path="/company/sendverify" element={<CompanySendVerify />} />
                <Route path="/company/verify" element={<CompanyVerify />} />
                <Route path="/user/password/reset" element={<UserPasswordResetRequest />} />
                <Route path="/user/password" element={<UserPasswordResetSave />} />
                <Route path="/company/password/reset" element={<CompanyPasswordResetRequest />} />
                <Route path="/company/password" element={<CompanyPasswordResetSave />} />
                <Route path="/messenger" element={<Messenger />} />

                {/* Csak USER típusú felhasználóknak */}
                <Route element={<IsLoggedIn mode="user" />}>
                    <Route path="/userhomepage" element={<UserHomePage />} />
                    <Route path="/favorites" element={<ShowFavoritesJobs />} />
                    <Route path="/uploadresume" element={<UploadResume />} />
                    <Route path="/JobApplications" element={<JobApplications />} />
                    <Route path="/job/show/:id" element={<ShowJob />} />
                    <Route path="/listjobs" element={<ListJobs />} />
                    <Route path="/usereditprofile" element={<UserEditProfile />} />
                </Route>

                {/* Csak COMPANY típusú felhasználóknak */}
                <Route element={<IsLoggedIn mode="company" />}>
                    <Route path="/company" element={<CompanyHomePage />} />
                    <Route path="/ShowListedJobs" element={<ShowListedJobs />} />
                    <Route path="/company/ATS/:id" element={<ApplicantTrackingSystem />} />
                    <Route path="/company/edit/:id" element={<EditJob />} />
                    <Route path="/CompanyEditProfile" element={<CompanyEditProfile />} />
                    <Route path="/AddJob" element={<AddJob />} />
                    <Route path="/employees" element={<ShowEmployees />} />
                </Route>

                {/* Csak kijelentkezve elérhető oldalak (GUEST) */}
                <Route element={<IsLoggedIn mode="guest" />}>
                    <Route path="/UserLoginPage" element={<UserLoginPage />} />
                    <Route path="/UserRegisterPage" element={<UserRegisterPage />} />
                    <Route path="/CompanyLoginPage" element={<CompanyLoginPage />} />
                    <Route path="/CompanyRegisterPage" element={<CompanyRegisterPage />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
