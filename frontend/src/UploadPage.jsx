import { useState, useActionState } from "react";
import { useNavigate } from "react-router";
import { MainLayout } from "./MainLayout.jsx";

export function UploadPage({ authToken }) {
  const [fileDataUrl, setFileDataUrl] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function uploadAction(_prev, formData) {
    const response = await fetch("/api/images", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      setError("Upload failed. Please try again.");
      return null;
    }

    const { id } = await response.json();
    navigate(`/images/${id}`);
    return null;
  }

  // I separated out error into a separate state to better handle
  // error clearing when the uploaded file changes. Hopefully that's
  // okay.
  const [, formAction, isPending] = useActionState(uploadAction, null);

  function readAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });
  }

  function onFileChange(event) {
    const file = event.target.files[0];
    if (file) {
      setError(null);
      readAsDataURL(file)
        .then((dataUrl) => setFileDataUrl(dataUrl))
        .catch((err) => console.error("Error reading file:", err));
    } else {
      setFileDataUrl(null);
    }
  }

  return (
    <form action={formAction}>
      <div>
        <label htmlFor="image">Choose image to upload: </label>
        <input
          id="image"
          name="image"
          type="file"
          accept=".png,.jpg,.jpeg"
          onChange={onFileChange}
          disabled={isPending}
          required
        />
      </div>
      <div>
        <label>
          <label htmlFor="name">Image title: </label>
          <input id="name" name="name" disabled={isPending} required />
        </label>
      </div>

      <div>
        {" "}
        {/* Preview img element */}
        {!error && fileDataUrl && (
          <img
            style={{ width: "20em", maxWidth: "100%" }}
            src={fileDataUrl}
            alt=""
          />
        )}
      </div>

      {error && <p>{error}</p>}

      <input type="submit" value="Confirm upload" disabled={isPending} />
    </form>
  );
}
