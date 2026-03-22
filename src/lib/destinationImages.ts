import santoriniImg from "@/assets/destination-santorini.jpg";
import kyotoImg from "@/assets/destination-kyoto.jpg";
import marrakechImg from "@/assets/destination-marrakech.jpg";
import patagoniaImg from "@/assets/destination-patagonia.jpg";

/** Correspond aux slugs renvoyés par GET /api/destinations */
export const destinationImages: Record<string, string> = {
  santorini: santoriniImg,
  kyoto: kyotoImg,
  marrakech: marrakechImg,
  patagonia: patagoniaImg,
};
