import { Phone, Mail, MapPin } from "lucide-react"

export default function ContactInfo(){

return(

<div className="space-y-10">

<h2 className="text-2xl font-semibold">

Contact Information

</h2>

<div className="space-y-6">

<div className="flex gap-4 items-start">

<Phone className="text-rose-500"/>

<div>

<p className="font-semibold">Phone</p>

<p className="text-gray-500">

+971 50 247 7593

</p>

</div>

</div>

<div className="flex gap-4 items-start">

<Mail className="text-rose-500"/>

<div>

<p className="font-semibold">Email</p>

<p className="text-gray-500">

info@southtravels.com

</p>

</div>

</div>

<div className="flex gap-4 items-start">

<MapPin className="text-rose-500"/>

<div>

<p className="font-semibold">Office</p>

<p className="text-gray-500">

Dubai Marina, Dubai, UAE

</p>

</div>

</div>

</div>

{/* Quick Contact */}

<div className="space-y-4 pt-6">

<a
href="https://wa.me/971502477593"
className="block bg-green-500 text-white p-4 rounded-xl text-center hover:bg-green-600"
>

Chat on WhatsApp

</a>

<a
href="tel:+971502477593"
className="block border p-4 rounded-xl text-center hover:bg-gray-100"
>

Call Reservation Team

</a>

</div>

</div>

)

}