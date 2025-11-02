# yesme
export default {
  async fetch(request) {
    const apiKey = "q0j94WRMhyP6lKHYvc36VpnXK0pHqd3T";
    const auth = "Basic " + btoa("api:" + apiKey);

    const compress = await fetch("https://api.tinify.com/shrink", {
      method: "POST",
      headers: { Authorization: auth },
      body: request.body
    });

    if (!compress.ok) return compress;

    const location = compress.headers.get("Location");
    const result = await fetch(location, {
      headers: { Authorization: auth }
    });

    return result;
  }
};
