import { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { DestinationRow } from "@/lib/destinations-data";
import { DESTINATION_COORDS } from "@/lib/destinationCoords";
import { cn } from "@/lib/utils";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type Props = {
  destinations: DestinationRow[];
  className?: string;
};

export function DestinationsResultsMap({ destinations, className }: Props) {
  const { t } = useTranslation();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  const plotted = useMemo(
    () => destinations.filter((d) => DESTINATION_COORDS[d.slug] != null),
    [destinations]
  );

  useEffect(() => {
    if (!mapRef.current) return;

    if (plotted.length === 0) {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      return;
    }

    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const map = L.map(mapRef.current, {
      scrollWheelZoom: false,
    });

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

    const latLngs: L.LatLng[] = [];

    plotted.forEach((d) => {
      const c = DESTINATION_COORDS[d.slug];
      const latlng = L.latLng(c.lat, c.lng);
      latLngs.push(latlng);
      const marker = L.marker(latlng, { icon });
      const tip = `<div class="text-left"><strong style="font-family:DM Serif Display,serif">${escapeHtml(d.name)}</strong><br/><span style="font-size:12px;opacity:0.85">${escapeHtml(d.price)}</span></div>`;
      marker.bindTooltip(tip, {
        direction: "top",
        sticky: true,
        opacity: 1,
        className: "dest-map-tooltip !rounded-lg !border !border-border !bg-card !px-2.5 !py-1.5 !shadow-md",
      });
      const popup = `<div class="min-w-[10rem] text-left"><strong style="font-family:DM Serif Display,serif;font-size:15px">${escapeHtml(d.name)}</strong><br/><span style="font-size:12px;color:#666">${escapeHtml(d.country)}</span><br/><span style="font-size:13px;font-weight:600">${escapeHtml(d.price)}</span><br/><a style="display:inline-block;margin-top:8px;font-size:13px;font-weight:500;color:hsl(16,65%,45%)" href="/destination/${encodeURIComponent(d.slug)}">${escapeHtml(t("destinationsGrid.mapPopupCta"))}</a></div>`;
      marker.bindPopup(popup, { closeButton: true });
      marker.addTo(map);
    });

    if (latLngs.length === 1) {
      map.setView(latLngs[0], 4);
    } else {
      map.fitBounds(L.latLngBounds(latLngs), { padding: [48, 48], maxZoom: 5 });
    }

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [plotted, t]);

  if (plotted.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn("mt-10 lg:mt-12", className)}
      aria-labelledby="destinations-results-map-heading"
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3
            id="destinations-results-map-heading"
            className="flex items-center gap-2 font-serif text-xl text-foreground md:text-2xl"
          >
            <MapPin className="h-5 w-5 shrink-0 text-accent" aria-hidden />
            {t("destinationsGrid.mapSectionTitle")}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{t("destinationsGrid.mapSectionHint")}</p>
        </div>
        <Link
          to="/carte"
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {t("destinationsGrid.mapOpenFullMap")}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
      <div
        className="overflow-hidden rounded-2xl border border-border shadow-lg shadow-foreground/[0.05]"
        role="region"
        aria-label={t("destinationsGrid.mapSectionTitle")}
      >
        <div ref={mapRef} className="h-[min(320px,50vh)] w-full min-h-[220px]" />
      </div>
    </motion.div>
  );
}
