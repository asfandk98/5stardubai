import ContactHero from "@/components/contactus/ContactHero"
import ContactForm from "@/components/contactus/ContactForm"
import ContactInfo from "@/components/contactus/ContactInfo"
import ContactMap from "@/components/contactus/ContactMap"
import ContactFaq from "@/components/contactus/ContactFaq"



export default function Page() {

return (

<div className="pt-28">

<ContactHero/>

<section className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 mt-16">

<ContactForm/>

<ContactInfo/>

</section>

<section className="max-w-7xl mx-auto px-6 mt-20">

<ContactMap/>

</section>

<section className="max-w-6xl mx-auto px-6 mt-20 pb-20">

<ContactFaq/>

</section>

</div>

)

}