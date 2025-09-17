import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import DecksPage from './pages/DecksPage'
import CardsPage from './pages/CardsPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DecksPage />} />
        <Route path="/decks" element={<DecksPage />} />
        <Route path="/decks/:deckId/cards" element={<CardsPage />} />
        <Route path="*" element={<DecksPage />} />
      </Routes>
    </Layout>
  )
}

export default App
