"use client"

import { useState } from "react"

export default function GuestSelector({ setGuests }){

const [guests,setLocalGuests] = useState({
adults:1,
children:0
})

function update(type,val){

const updated={
...guests,
[type]:Math.max(0,guests[type]+val)
}

setLocalGuests(updated)
setGuests(updated)

}

return(

<div className="space-y-3">

<div className="flex justify-between">
Adults
<div>
<button onClick={()=>update("adults",-1)}>-</button>
<span className="mx-3">{guests.adults}</span>
<button onClick={()=>update("adults",1)}>+</button>
</div>
</div>

<div className="flex justify-between">
Children
<div>
<button onClick={()=>update("children",-1)}>-</button>
<span className="mx-3">{guests.children}</span>
<button onClick={()=>update("children",1)}>+</button>
</div>
</div>

</div>

)
}