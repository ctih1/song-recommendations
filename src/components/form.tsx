"use client"

import { useEffect, useState } from "react"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import { useRouter } from 'next/navigation'

export default function Form() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [comment, setComment] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log(value);
    if(!value.startsWith("https://open.spotify.com/track/")) {
      setInvalid(true);
    } else {
      setInvalid(!(/^https?:\/\/open\.spotify\.com\/track\/[A-Za-z0-9]{22}(\?.*)?$/.test(value)));
    }
  }, [value])

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      const data = new FormData();
      data.append("comment", comment);
      data.append("link", value);
      setLoading(true);
      fetch("/api/recommendations", {
        method: "POST",
        body: data
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      }).then(_ => {
        setLoading(false);
        router.refresh();
      });
    }}>
        <div className="item">
          <Label className="text-2xl" htmlFor="song-picker">Enter your Spotify link</Label>
          <Input id="song-picker" onChange={event => setValue(event.target.value)} placeholder="https://open.spotify.com/track/..." />
        </div>

        <div className="item">
          <Label className="text-2xl" htmlFor="comment">Comment</Label>
          <Input id="comment" onChange={event => setComment(event.target.value)} placeholder="It's a pretty cool song ig" />
        </div>

        {invalid && <p>Please input a real Spotify song link</p>}
        {comment.length < 5 && <p>Please enter a comment</p>}
        <Button className="mt-2" disabled={invalid || comment.length < 5 || loading} type="submit">Submit</Button>
    </form>
  )
}