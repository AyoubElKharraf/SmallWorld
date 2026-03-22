import AISuggestions from "@/components/AISuggestions";

const AssistantPage = () => (
  <div className="min-h-[60vh]">
    <section className="px-6 pt-8 pb-0 max-w-7xl mx-auto">
      <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
        <strong className="text-foreground">Comment ça marche :</strong> les suggestions affichées sont chargées
        depuis votre API (données MySQL) et filtrées selon votre texte. Pour connecter un modèle de langage
        externe (OpenAI, etc.), il faudra ajouter une clé API côté serveur et enrichir la route{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">GET /api/suggestions</code> — aucune action
        obligatoire tant que l’API locale tourne.
      </p>
    </section>
    <AISuggestions />
  </div>
);

export default AssistantPage;
