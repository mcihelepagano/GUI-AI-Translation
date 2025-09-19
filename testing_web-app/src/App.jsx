import { useState } from 'react'
import { Route, Routes } from "react-router"
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css'
import Homepage from './components/Homepage';
import Overlay from './components/Overlay';
import Article from './components/Article';
import Company from './components/Company';

function App() {

  return <>
      <Routes>
        <Route element={<Overlay/>} >
          <Route path='/' element={<Homepage/>}/>
          <Route path='/article' element={<Article/>}/>
          <Route path='/company' element={<Company/>}/>
          <Route path="*" element={<h1 className='ms-3'>404 Page Not Found</h1>} />
        </Route>
      </Routes>
    </>
}

export default App
