import { useState, useEffect } from "react";
import { ImageGrid } from "./ImageGrid.jsx";

export function AllImages() {
  const [imageData, setImageData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/images");
        if (!response.ok) {
          throw new Error(
            `Error: HTTP ${response.status} ${response.statusText}`,
          );
        }
        const data = await response.json();
        setImageData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <>
      <h2>All Images</h2>
      <ImageGrid images={imageData} />
    </>
  );
}
