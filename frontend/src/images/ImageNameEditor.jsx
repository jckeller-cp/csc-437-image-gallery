import { useState } from "react";

export function ImageNameEditor({
  imageId,
  initialValue,
  authToken,
  onNameChange,
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(initialValue || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function handleEditPressed() {
    setIsEditingName(true);
    setNameInput(initialValue || "");
  }
  async function handleSubmitPressed() {
    setSubmitError("");
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/images/${imageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ name: nameInput }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.message ?? `HTTP ${response.status} ${response.statusText}`,
        );
      }
      onNameChange(nameInput);
      setIsEditingName(false);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isEditingName) {
    return (
      <div style={{ margin: "1em 0" }}>
        <label>
          New Name
          <input
            required
            disabled={isSubmitting}
            style={{ marginLeft: "0.5em" }}
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
        </label>
        <button
          disabled={nameInput.length === 0 || isSubmitting}
          onClick={handleSubmitPressed}
        >
          Submit
        </button>
        <button onClick={() => setIsEditingName(false)}>Cancel</button>
        <div aria-live="polite">
          {isSubmitting && <p>Renaming image...</p>}
          {submitError && <p>Error: {submitError}</p>}
        </div>
      </div>
    );
  } else {
    return (
      <div style={{ margin: "1em 0" }}>
        <button onClick={handleEditPressed}>Edit name</button>
      </div>
    );
  }
}
