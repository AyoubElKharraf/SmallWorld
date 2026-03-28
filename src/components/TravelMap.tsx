import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Map as MapIcon, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import L from "leaflet";
import "leaflet.markercluster";
import { apiUrl } from "@/lib/api";
import { ErrorStatePanel } from "@/components/ErrorStatePanel";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";

type MarkerRow = {
  name: string;
  lat: number | string;
  lng: number | string;
  info: string;
};

const FALLBACK_MARKERS: MarkerRow[] = [
  { name: "Santorin", lat: 36.3932, lng: 25.4615, info: "Grèce · 4.8★" },
  { name: "Kyoto", lat: 35.0116, lng: 135.7681, info: "Japon · 4.9★" },
  { name: "Marrakech", lat: 31.6295, lng: -7.9811, info: "Maroc · 4.7★" },
  { name: "Patagonie", lat: -50.3402, lng: -72.2648, info: "Argentine · 4.9★" },
  { name: "Lisbonne", lat: 38.7223, lng: -9.1393, info: "Portugal · 4.8★" },
  { name: "Porto", lat: 41.1579, lng: -8.6291, info: "Portugal · 4.7★" },
];

const fetchMarkers = async (): Promise<MarkerRow[]> => {
  const r = await fetch(apiUrl("/api/map-markers"));
  if (!r.ok) throw new Error("markers");
  return r.json();
};

const TravelMap = () => {
  const { t } = useTranslation();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["map-markers"],
    queryFn: fetchMarkers,
    retry: 1,
  });

  const markers = isError || !data?.length ? FALLBACK_MARKERS : data;

  useEffect(() => {
    if (!mapRef.current || isLoading) return;

    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const map = L.map(mapRef.current, {
      scrollWheelZoom: false,
      zoomControl: false,
    }).setView([30, 10], 2);

    L.control.zoom({ position: "topright" }).addTo(map);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    const icon = L.divIcon({
      className: "custom-marker",
      html: `<div style="width:14px;height:14px;background:hsl(16,65%,55%);border:2.5px solid hsl(38,33%,96%);border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.2);"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });

    const cluster = (L as typeof L & { markerClusterGroup: (opts?: object) => L.Layer }).markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 48,
    });

    markers.forEach((m) => {
      const lat = Number(m.lat);
      const lng = Number(m.lng);
      const marker = L.marker([lat, lng], { icon });
      marker.bindPopup(
        `<div style="font-family:'DM Sans',sans-serif;"><strong style="font-family:'DM Serif Display',serif;font-size:15px;">${m.name}</strong><br/><span style="color:#666;font-size:12px;">${m.info}</span></div>`,
        { closeButton: false, offset: [0, -4] }
      );
      cluster.addLayer(marker);
    });

    cluster.addTo(map);

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [markers, isLoading]);

  return (
    <section aria-labelledby="travel-map-heading">
      <PageShell className="pb-16 pt-8 md:pb-24 md:pt-10">
        <PageHeader
          titleId="travel-map-heading"
          size="hero"
          kicker={t("map.section")}
          title={t("map.title")}
          icon={MapIcon}
        />

      {isError && (
        <div className="mb-6">
          <ErrorStatePanel
            variant="inline"
            title={t("map.errorTitle")}
            description={t("map.errorDesc")}
            onRetry={() => refetch()}
            isRetrying={isFetching}
          />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl overflow-hidden shadow-xl shadow-foreground/[0.06] border border-border relative"
      >
        {isLoading && (
          <div className="absolute inset-0 z-[500] flex items-center justify-center bg-background/80 gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
            {t("map.loading")}
          </div>
        )}
        <div ref={mapRef} className="w-full h-[500px]" role="presentation" />
      </motion.div>
      </PageShell>
    </section>
  );
};

export default TravelMap;
