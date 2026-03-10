import { AllImages } from "./images/AllImages.jsx";
import { Routes, Route } from "react-router";
import { ImageDetails } from "./images/ImageDetails.jsx";
import { UploadPage } from "./UploadPage.jsx";
import { LoginPage } from "./LoginPage.jsx";
import { MainLayout } from "./MainLayout.jsx";
import { VALID_ROUTES } from "../../backend/src/shared/ValidRoutes.js";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<AllImages />} />
        <Route path={VALID_ROUTES.SINGLE_IMAGE} element={<ImageDetails />} />
        <Route path={VALID_ROUTES.UPLOAD} element={<UploadPage />} />
        <Route path={VALID_ROUTES.LOGIN} element={<LoginPage />} />
      </Route>
    </Routes>
  );
}

export default App;
