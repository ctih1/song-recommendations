import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import SpotifyWebApi from "spotify-web-api-node";

const api = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

function extractTrackId(url: string): string | undefined {
    const match = url.match(/track\/([a-zA-Z0-9]+)/);
    return match ? match[1] : undefined;
};

let expireTime = new Date();
expireTime.setSeconds(expireTime.getSeconds() - 60);

export async function POST(req: Request) {
    const body = await req.formData()

    const link = body.get("link")?.toString();
    const comment = body.get("comment")?.toString();

    if(!link || !comment) {
        return NextResponse.json({error: "Invalid form data"}, { status: 400})
    }

    if(!/^https?:\/\/open\.spotify\.com\/track\/[A-Za-z0-9]{22}(\?.*)?$/.test(link)) {
        return NextResponse.json({error: `Invalid song link ${link}`}, { status: 400})
    }

    if(comment.length > 800) {
        return NextResponse.json({error: "Comment too big"}, { status: 413})
    }

    if(expireTime < new Date()) {
        console.log("Creating new auth token...");
        const data = await api.clientCredentialsGrant();
        api.setAccessToken(data.body.access_token);
        
        expireTime = new Date();
        expireTime.setSeconds(expireTime.getSeconds() + data.body.expires_in)
    } else {
        console.log("Skipping auth token generation");
    }

    const trackId = extractTrackId(link);
    if(!trackId) {
        console.error("Track id not found")
        return NextResponse.json({error: "Invalid link"}, { status: 400 });
    }

    const songData = await api.getTrack(trackId);
    const artistData = await api.getArtist(songData.body.artists[0].id);

    const recommendation = await prisma.recommendation.create({
        data: {
            comment: comment,
            link: link,
            imageLink: songData.body.album.images[0].url,
            genres: artistData.body.genres,
            name: songData.body.name,
            artist: songData.body.artists.map(artist => artist.name)
        }
    })

    return NextResponse.json(recommendation, {status: 200})
}