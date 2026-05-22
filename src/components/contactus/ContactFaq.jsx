"use client"

import { useState } from "react"

const faqs = [

{
q:"How can I book a hotel?",
a:"Simply choose your hotel, select dates, and complete the reservation online."
},

{
q:"Do you offer airport pickup?",
a:"Yes, airport transfer services are available upon request."
},

{
q:"Can I cancel my booking?",
a:"Cancellation policies depend on the hotel and room type."
}

]

export default function ContactFAQ(){

const [open,setOpen] = useState(null)

return(

<div>

<h2 className="text-3xl font-semibold mb-8 text-center">

Frequently Asked Questions

</h2>

<div className="space-y-4">

{faqs.map((faq,i)=>(
<div key={i} className="border rounded-xl p-5">

<button
onClick={()=>setOpen(open===i?null:i)}
className="font-semibold w-full text-left"
>

{faq.q}

</button>

{open===i && (

<p className="text-gray-500 mt-3">

{faq.a}

</p>

)}

</div>
))}

</div>

</div>

)

}