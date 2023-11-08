const getCourses = () => {
  const apiKey =
    "7714~P0Yvep4cIK7uYdySbNRD1vd28xAuH9BX4Rv8GIueqYhMvKCGNnVeyFeu8JYohwH0";
  const url = "https://canvas.instructure.com/api/v1/courses"; // Replace with the specific endpoint you need

  fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => console.error("Error:", error));
};

getCourses();
