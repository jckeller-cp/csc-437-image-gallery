import { useState, useActionState } from "react";
import { useNavigate } from "react-router";
import { MainLayout } from "./MainLayout.jsx";

export function UploadPage({ authToken }) {
  const [fileDataUrl, setFileDataUrl] = useState(null);
  const navigate = useNavigate();

  async function uploadAction(previousState, formData) {
    const response = await fetch("/api/images", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      return { error: "Upload failed. Please try again." };
    }

    const { id } = await response.json();
    navigate(`/images/${id}`);
    return { error: null };
  }

  const [state, formAction, isPending] = useActionState(uploadAction, { error: null });

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
        {!state.error && fileDataUrl && (
          <img
            style={{ width: "20em", maxWidth: "100%" }}
            src={fileDataUrl}
            alt=""
          />
        )}
      </div>

      {state.error && <p>{state.error}</p>}

      <input type="submit" value="Confirm upload" disabled={isPending} />
    </form>
  );
}
