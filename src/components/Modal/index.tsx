import React from 'react'
import {
   
    ModalOverlay,
    ModalButton,
    ModalContent,
    ModalHeader,
   
  } from './style'
const Modal = ({children,heading}) => {
  return (
    <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              Edit Item <br />
              {heading}
            </ModalHeader>

        {children}
          </ModalContent>
        </ModalOverlay>
  )
}

export default Modal


