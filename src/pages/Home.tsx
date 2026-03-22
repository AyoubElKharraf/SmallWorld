import HeroSection from "@/components/HeroSection";
import HomeFeatures from "@/components/HomeFeatures";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

const Home = () => {
  const handleSearch = async (query: string) => {
    const toastId = toast.loading(`Recherche « ${query} »…`, {
      description: "L'IA prépare vos suggestions de voyage.",
    });
    try {
      const res = await apiFetch("/api/search", {
        method: "POST",
        body: JSON.stringify({ query }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? res.statusText);
      }
      toast.success("Recherche enregistrée", {
        id: toastId,
        description: "Vous pouvez explorer Destinations et l’assistant pour affiner votre voyage.",
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const network =
        msg === "Failed to fetch" || msg.includes("NetworkError") || msg.includes("Load failed");
      toast.error(
        network
          ? "Connexion au serveur impossible"
          : "Impossible d'enregistrer la recherche",
        {
          id: toastId,
          description: network
            ? "Lancez l’API (ex. npm run dev --prefix server) ou vérifiez que le port 3001 répond."
            : msg,
        }
      );
    }
  };

  return (
    <>
      <HeroSection onSearch={handleSearch} />
      <HomeFeatures />
    </>
  );
};

export default Home;
