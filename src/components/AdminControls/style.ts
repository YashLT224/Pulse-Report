import styled from 'styled-components';


export const Bar= styled.div`
height:65px;
border-bottom:1.5px solid #d4d4d4;
display:flex;
padding:0px 16px;
background-color:read;
`

export const Icon=styled.img`
width:24px;
height:24px;
`
export const Text=styled.span`
padding:0px 4px;
`

export const MenuItem=styled.div`
display:flex;
align-items:center;
padding:0px 12px;
box-sizing: border-box;
cursor:pointer;
&:hover {
    background-color: #dddddd;
    border-bottom:2px solid #ED5F00;
  }
`