"use client"

import { useState,useEffect } from "react"

export default function WishlistButton({ hotelId }){

const [saved,setSaved] = useState(false)

useEffect(()=>{

const status = localStorage.getItem(`wishlist-${hotelId}`)
setSaved(status==="true")

},[])

function toggle(){

const newState=!saved
setSaved(newState)

localStorage.setItem(
`wishlist-${hotelId}`,
newState
)

}

return(

<button onClick={toggle}>

{saved ? "❤️" : "🤍"}

</button>

)

}