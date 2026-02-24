
async function testApi() {
  const shareId = "cpgeKtYa9O48";
  const url = `http://localhost:5000/api/forms/public/${shareId}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("API Response for public form:");
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

testApi();
