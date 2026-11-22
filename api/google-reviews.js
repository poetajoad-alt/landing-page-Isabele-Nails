
/* Vercel Serverless Function. Configure GOOGLE_PLACES_API_KEY + GOOGLE_PLACE_ID. */
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Método não permitido" });
  }
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!apiKey || !placeId) return res.status(503).json({ configured: false });
  try {
    const response = await fetch("https://places.googleapis.com/v1/places/" + encodeURIComponent(placeId), {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "rating,userRatingCount,reviews,googleMapsUri"
      },
      signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) {
      console.error("Google Places status", response.status);
      return res.status(502).json({ error: "Não foi possível consultar avaliações" });
    }
    const place = await response.json();
    if (typeof place.rating !== "number") return res.status(502).json({ error: "Sem nota pública retornada" });
    const reviews = (Array.isArray(place.reviews) ? place.reviews : []).map(function (review) {
      return {
        rating: Number(review.rating) || 0,
        author: review.authorAttribution && review.authorAttribution.displayName || "",
        authorUri: review.authorAttribution && review.authorAttribution.uri || "",
        text: review.text && review.text.text || review.originalText && review.originalText.text || "",
        googleMapsUri: review.googleMapsUri || "",
        publishTime: review.publishTime || ""
      };
    });
    return res.status(200).json({
      rating: place.rating,
      total: Number(place.userRatingCount) || 0,
      googleMapsUri: place.googleMapsUri || "",
      reviews: reviews
    });
  } catch (error) {
    console.error("Falha ao consultar o Google Places", error && error.message);
    return res.status(502).json({ error: "Avaliações temporariamente indisponíveis" });
  }
};
