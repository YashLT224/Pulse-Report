import { useEffect, useState } from 'react'
import type { Schema } from '../amplify/data/resource'
import { generateClient } from 'aws-amplify/data'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css';

import Home from './Screens/Home'
const client = generateClient<Schema>()

function App() {
  const [todos, setTodos] = useState<Array<Schema['Todo']['type']>>([])

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data: any) => setTodos([...data.items]),
    })
  }, [])

  function createTodo() {
    client.models.Todo.create({ content: window.prompt('Todo content') })
  }

  return (
    <Authenticator  initialState="signin"
    loginMechanisms={["phone_number"]}
    signUpAttributes={["name"]}
    
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Home />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Authenticator>
  )
}

export default App
