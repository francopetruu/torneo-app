import StandingsTable from "@/components/features/standings/standings-table";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="mb-6 text-3xl font-bold">Tournament Standings</h2>
      <StandingsTable />
    </div>
  );
}
