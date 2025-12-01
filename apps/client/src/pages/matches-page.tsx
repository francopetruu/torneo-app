import MatchesList from "@/components/features/matches/matches-list";

export default function MatchesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="mb-6 text-3xl font-bold">Matches</h2>
      <MatchesList />
    </div>
  );
}
