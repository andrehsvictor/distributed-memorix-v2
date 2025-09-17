import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import DecksPage from './pages/DecksPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DecksPage />} />
        <Route path="/decks" element={<DecksPage />} />
        {/* TODO: Add more routes */}
        <Route path="*" element={<DecksPage />} />
      </Routes>
    </Layout>
  )
}

export default App
