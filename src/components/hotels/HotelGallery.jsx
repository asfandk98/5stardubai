"use client"

import { useState } from "react"
import Lightbox from "yet-another-react-lightbox"
import "yet-another-react-lightbox/styles.css"

export default function HotelGallery({ images }) {

const [open,setOpen] = useState(false)

return(

<>
<div className="grid grid-cols-4 grid-rows-2 gap-2 h-[420px]">

<img
src={images[0]}
onClick={()=>setOpen(true)}
className="col-span-2 row-span-2 object-cover rounded-xl cursor-pointer"
/>

{images.slice(1,5).map((img,i)=>(
<img
key={i}
src={img}
onClick={()=>setOpen(true)}
className="object-cover rounded-xl cursor-pointer"
/>
))}

</div>

<Lightbox
open={open}
close={()=>setOpen(false)}
slides={images.map(img=>({src:img}))}
/>

</>

)
}