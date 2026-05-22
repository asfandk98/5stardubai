export default function Reviews(){

const reviews=[
{
name:"Sarah",
rating:5,
comment:"Amazing stay and beautiful view."
},
{
name:"John",
rating:4,
comment:"Great location and clean rooms."
}
]

return(

<div className="space-y-6">

{reviews.map((r,i)=>(
<div key={i} className="border-b pb-4">

<p className="font-semibold">{r.name}</p>

<p>{"⭐".repeat(r.rating)}</p>

<p className="text-gray-600">{r.comment}</p>

</div>
))}

</div>

)

}