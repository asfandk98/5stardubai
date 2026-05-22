import { FiWifi, FiTv, FiCoffee, FiMap } from "react-icons/fi"

export default function AmenitiesGrid(){

const amenities=[
"Free Wifi",
"Smart TV",
"Breakfast",
"Parking",
"Swimming Pool",
"Air Conditioning"
]

return(

<div className="grid grid-cols-2 gap-4">

{amenities.map((a,i)=>(
<div key={i} className="flex items-center gap-3">

<FiWifi/>

<span>{a}</span>

</div>
))}

</div>

)
}