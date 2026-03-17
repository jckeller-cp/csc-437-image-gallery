import { AllImages } from "./images/AllImages.jsx";
import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router";
import { ImageDetails } from "./images/ImageDetails.jsx";
import { UploadPage } from "./UploadPage.jsx";
import { LoginPage } from "./LoginPage.jsx";
import { MainLayout } from "./MainLayout.jsx";
import { VALID_ROUTES } from "../../backend/src/shared/ValidRoutes.js";
import { ProtectedRoute } from "./ProtectedRoute.jsx";

function App() {
  const [authToken, setAuthToken] = useState(null);
  const navigate = useNavigate();

  function onLogin(token) {
    setAuthToken(token);
    navigate("/", { replace: true });
  }

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route
          index
          element={
            <ProtectedRoute authToken={authToken}>
              <AllImages authToken={authToken} />
            </ProtectedRoute>
          }
        />
        <Route
          path={VALID_ROUTES.SINGLE_IMAGE}
          element={
            <ProtectedRoute authToken={authToken}>
              <ImageDetails authToken={authToken} />
            </ProtectedRoute>
          }
        />
        <Route
          path={VALID_ROUTES.UPLOAD}
          element={
            <ProtectedRoute authToken={authToken}>
              <UploadPage authToken={authToken} />
            </ProtectedRoute>
          }
        />
        <Route
          path={VALID_ROUTES.LOGIN}
          element={<LoginPage isRegistering={false} onLogin={onLogin} />}
        />
        <Route
          path={VALID_ROUTES.REGISTER}
          element={<LoginPage isRegistering={true} onLogin={onLogin} />}
        />
      </Route>
    </Routes>
  );
}

export default App;
