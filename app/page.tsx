'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function Home() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push('/login')
        return
      }

      setUser(data.user)

      const { data: bookmarksData } = await supabase
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false })

      setBookmarks(bookmarksData || [])
      setLoading(false)
    }

    init()
  }, [])

  useEffect(() => {
  if (!user) return

  const channel = supabase
    .channel('bookmarks-realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bookmarks',
        filter: `user_id=eq.${user.id}`,
      },
      () => {
        fetchBookmarks()
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [user])


  const addBookmark = async () => {
    if (!title || !url) return

    try {
      new URL(url)
    } catch {
      alert('Please enter a valid URL')
      return
    }


    await supabase
      .from('bookmarks')
      .insert({
        user_id: user.id,
        title,
        url,
      })
      .select()

    setTitle('')
    setUrl('')

    fetchBookmarks()
  }

  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false })

    setBookmarks(data || [])
  }

  const deleteBookmark = async (id: string) => {
    await supabase.from('bookmarks').delete().eq('id', id)
    fetchBookmarks()
  }

  if (loading) return <div className="p-10">Loading...</div>

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">
          Welcome, {user?.email}
        </h1>

        <button
          onClick={async () => {
            await supabase.auth.signOut()
            router.push('/login')
          }}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 w-1/3"
        />
        <input
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="border p-2 w-1/2"
        />
        <button
          onClick={addBookmark}
          className="bg-blue-500 text-white px-4 rounded"
        >
          Add
        </button>
      </div>

      <ul className="space-y-3">
        {bookmarks.map((b) => (
          <li
            key={b.id}
            className="flex justify-between border p-3 rounded"
          >
          <a
            href={b.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600"
          >
            {b.title}
          </a>


            <button
              onClick={() => deleteBookmark(b.id)}
              className="text-red-500"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
