import { useSelector } from 'react-redux'

const Home = () => {
  const data= useSelector((state:any)=>state.authReducer)
  console.log(data)
  return (
    <div>
      Home
    </div>
  )
}

export default Home
