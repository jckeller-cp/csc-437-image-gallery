import { AllImages } from "./images/AllImages.jsx";
import { Routes, Route } from "react-router";
import { ImageDetails } from "./images/ImageDetails.jsx";
import { UploadPage } from "./UploadPage.jsx";
import { LoginPage } from "./LoginPage.jsx";
import { MainLayout } from "./MainLayout.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<AllImages />} />
        <Route path="images/:imageId" element={<ImageDetails />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="login" element={<LoginPage />} />
      </Route>
    </Routes>
  );
}

export default App;
