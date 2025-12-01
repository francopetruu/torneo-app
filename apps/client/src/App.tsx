import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/layout";
import HomePage from "./pages/home-page";
import MatchesPage from "./pages/matches-page";
import MatchDetailPage from "./pages/match-detail-page";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/match/:id" element={<MatchDetailPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
