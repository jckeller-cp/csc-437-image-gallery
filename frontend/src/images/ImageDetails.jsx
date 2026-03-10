import { useState, useEffect } from "react";
import { useParams } from "react-router";

export function ImageDetails() {
  const { imageId } = useParams();

  const [image, setImage] = useState(null);
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
        setImage(data[imageId]);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [imageId]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!image) {
    return <h2>Image not found</h2>;
  }

  return (
    <>
      <h2>{image.name}</h2>
      <p>By {image.author.username}</p>
      <img className="ImageDetails-img" src={image.src} alt={image.name} />
    </>
  );
}
