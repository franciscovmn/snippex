import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'

import SnippexForm from './views/snippet-form'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<><h1>Snippex</h1> <a href='/new'>novo snippet</a></>}></Route>
          <Route path='/new' element={<SnippexForm />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
