import React,{useState} from 'react'
import {Bar,Icon,Text,MenuItem} from './style.ts'
import FormSvg from '../../assets/form.svg'
import addUser from '../../assets/adduser.svg'
import Approval from '../../assets/approval.svg'
import List from '../../assets/list.svg'
const Tiles=[
    {
        name:'Form Access',
        icon:FormSvg
    },
    {
        name:'Approval Requests',
        icon:Approval,
    },
    {
        name:'Add User',
        icon:addUser
    },
    {
        name:'User List',
        icon:List
    }
]

const Tile=({data})=>{
    return <MenuItem>
         <Icon src={data.icon} alt={data.name} />
        <Text>{data.name}</Text>
       
    </MenuItem>
}


const AdminControls = () => {
    
  return (
    <div>
      <Bar>
          {Tiles.map((tile,index)=>{
             return <Tile data={tile} key={index}/>
          })
          }
      </Bar>
    </div>
  )
}

export default AdminControls

