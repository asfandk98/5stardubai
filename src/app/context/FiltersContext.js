"use client"
// src/app/context/FiltersContext.js

import { createContext, useContext, useState } from "react"

const FiltersContext = createContext(null)

export function FiltersProvider({ children }) {
  const [filters, setFilters] = useState({})
  return (
    <FiltersContext.Provider value={{ filters, setFilters }}>
      {children}
    </FiltersContext.Provider>
  )
}

export function useFilters() {
  const ctx = useContext(FiltersContext)
  if (!ctx) throw new Error("useFilters must be used inside <FiltersProvider>")
  return ctx
}