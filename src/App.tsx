import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Import existing page components
import CharacterCreator from './pages/CharacterCreator'
import Chat from './pages/Chat'
import Dollhouse from './pages/Dollhouse'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CharacterCreator />} />
        <Route path="/chat/:characterId" element={<Chat />} />
        <Route path="/dollhouse" element={<Dollhouse />} />
      </Routes>
    </BrowserRouter>
  )
}


export default App;
