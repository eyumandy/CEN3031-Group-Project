// hooks/useUserProfile.js
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export function useUserProfile() {
  const router = useRouter()
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    initials: "",
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const getInitials = (fullName) => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return ""
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  useEffect(() => {
    const authToken = localStorage.getItem("authToken")
    if (!authToken) {
      router.push("/login")
      return
    }

    async function fetchProfile() {
      try {
        const res = await fetch("http://127.0.0.1:5000/user/profile", {
          headers: { Authorization: `Bearer ${authToken}` },
        })
        if (!res.ok) throw new Error("Unauthorized")

        const { name, email } = await res.json()
        setProfile({ name, email, initials: getInitials(name) })
      } catch (err) {
        console.error(err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  return { ...profile, loading, error }
}
