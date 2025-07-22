import { useState } from 'react'
import './css/App.css'
import Home from './pages/Home'
import Favorite from './pages/Favorites'
import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import MoviePage from './pages/MoviePage'



function App() {
  const [count, setCount] = useState(0)

  return (
  
  <div>
    <NavBar />
    <main className="main-content">
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/favorites" element={<Favorite />}/>
        <Route path="/movie-page" element={<MoviePage />} />
        <Route path="/movie/:movieId" element={<MoviePage />} />
      </Routes>
    </main>
  </div>
  
  )
}

export default App
