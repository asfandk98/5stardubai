'use client'

import { useState } from "react"
import { Briefcase, MapPin, Clock, DollarSign, Heart, Zap, Users, TrendingUp, ChevronDown, ChevronUp } from "lucide-react"

export default function CareersPage() {
  const [expandedJob, setExpandedJob] = useState(null)

  const perks = [
    {
      icon: Heart,
      title: "Health & Wellness",
      description: "Comprehensive health insurance and wellness programs"
    },
    {
      icon: TrendingUp,
      title: "Career Growth",
      description: "Continuous learning opportunities and clear career paths"
    },
    {
      icon: Users,
      title: "Great Culture",
      description: "Collaborative environment with work-life balance"
    },
    {
      icon: Zap,
      title: "Innovation First",
      description: "Work with cutting-edge tech and shape the future"
    },
  ]

  const openings = [
    {
      id: 1,
      title: "Senior Full-Stack Developer",
      department: "Engineering",
      location: "Dubai, UAE",
      type: "Full-time",
      salary: "AED 15,000 - 25,000",
      description: "We're looking for an experienced full-stack developer to build and scale our booking platform. You'll work with React, Node.js, and modern cloud infrastructure.",
      requirements: [
        "5+ years of experience with React and Node.js",
        "Experience with cloud platforms (AWS/Azure)",
        "Strong understanding of database design",
        "Experience with payment gateway integrations"
      ],
      responsibilities: [
        "Build and maintain booking platform features",
        "Collaborate with product and design teams",
        "Optimize application performance",
        "Mentor junior developers"
      ]
    },
    {
      id: 2,
      title: "Product Manager",
      department: "Product",
      location: "Dubai, UAE",
      type: "Full-time",
      salary: "AED 18,000 - 28,000",
      description: "Lead the vision and execution of our product roadmap. Work closely with engineering, design, and business teams to deliver exceptional user experiences.",
      requirements: [
        "3+ years in product management",
        "Experience in travel/hospitality tech",
        "Strong analytical and communication skills",
        "Understanding of agile methodologies"
      ],
      responsibilities: [
        "Define product strategy and roadmap",
        "Gather and prioritize requirements",
        "Work with design to create user flows",
        "Analyze metrics and iterate on features"
      ]
    },
    {
      id: 3,
      title: "Customer Success Manager",
      department: "Customer Support",
      location: "Dubai, UAE",
      type: "Full-time",
      salary: "AED 8,000 - 12,000",
      description: "Be the voice of our customers. Help travelers have seamless booking experiences and build lasting relationships with our hotel partners.",
      requirements: [
        "2+ years in customer success or support",
        "Excellent communication skills (English & Arabic)",
        "Problem-solving mindset",
        "Experience with CRM tools"
      ],
      responsibilities: [
        "Respond to customer inquiries promptly",
        "Resolve booking issues and complaints",
        "Build relationships with hotel partners",
        "Identify opportunities for improvement"
      ]
    },
    {
      id: 4,
      title: "UI/UX Designer",
      department: "Design",
      location: "Dubai, UAE (Hybrid)",
      type: "Full-time",
      salary: "AED 12,000 - 18,000",
      description: "Create beautiful, intuitive interfaces that make hotel booking effortless. Work on web and mobile experiences used by thousands daily.",
      requirements: [
        "3+ years of UI/UX design experience",
        "Proficiency in Figma and design systems",
        "Strong portfolio showcasing web/mobile work",
        "Understanding of user research methods"
      ],
      responsibilities: [
        "Design web and mobile interfaces",
        "Create and maintain design system",
        "Conduct user research and testing",
        "Collaborate with developers on implementation"
      ]
    },
    {
      id: 5,
      title: "Marketing Manager",
      department: "Marketing",
      location: "Dubai, UAE",
      type: "Full-time",
      salary: "AED 15,000 - 22,000",
      description: "Drive growth through creative marketing campaigns. Own our digital presence and help millions discover their perfect hotel stay.",
      requirements: [
        "4+ years in digital marketing",
        "Experience with SEO, SEM, and social media",
        "Data-driven approach to marketing",
        "Experience in travel/e-commerce industry"
      ],
      responsibilities: [
        "Develop and execute marketing strategies",
        "Manage digital advertising campaigns",
        "Analyze campaign performance",
        "Build brand awareness and engagement"
      ]
    },
  ]

  const toggleJob = (id) => {
    setExpandedJob(expandedJob === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-rose-500 to-rose-600 text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Join Our Team
          </h1>
          <p className="text-lg md:text-xl text-rose-100 max-w-2xl mx-auto">
            Help us revolutionize hotel booking and create unforgettable experiences for travelers across the UAE and beyond.
          </p>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Why Work With Us?</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            We're building the future of hotel booking. Join a team that values innovation, collaboration, and making a real impact.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {perks.map((perk, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-md transition">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-rose-100 rounded-full mb-4">
                  <perk.icon className="w-7 h-7 text-rose-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{perk.title}</h3>
                <p className="text-sm text-gray-600">{perk.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Open Positions</h2>
          
          <div className="space-y-4">
            {openings.map((job) => (
              <div key={job.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                
                {/* Job Header */}
                <div
                  onClick={() => toggleJob(job.id)}
                  className="p-6 cursor-pointer hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Briefcase size={14} />
                          {job.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {job.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign size={14} />
                          {job.salary}
                        </span>
                      </div>
                    </div>
                    <button className="text-rose-500 p-2">
                      {expandedJob === job.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Job Details - Expandable */}
                {expandedJob === job.id && (
                  <div className="px-6 pb-6 border-t">
                    <div className="pt-6 space-y-6">
                      
                      {/* Description */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">About the Role</h4>
                        <p className="text-gray-700">{job.description}</p>
                      </div>

                      {/* Requirements */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                          {job.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Responsibilities */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Responsibilities</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                          {job.responsibilities.map((resp, index) => (
                            <li key={index}>{resp}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Apply Button */}
                      <div className="pt-4">
                        <button className="w-full md:w-auto bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-xl font-semibold transition">
                          Apply for this Position
                        </button>
                      </div>

                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Don't See a Perfect Fit?
          </h2>
          <p className="text-gray-600 mb-8">
            We're always looking for talented people. Send us your resume and we'll keep you in mind for future opportunities.
          </p>

          {/* FIX: was missing opening <a tag and had bare href= attribute floating in JSX */}
          <a
            href="mailto:careers@searchdubai.com"
            className="inline-block bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-xl font-semibold transition"
          >
            Send Your Resume
          </a>
        </div>
      </section>

    </div>
  )
}