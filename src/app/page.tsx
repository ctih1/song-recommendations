export const dynamic = "force-dynamic";
import Form from '@/components/form';
import { prisma } from '../lib/prisma';

export default async function Home() {
  const recommendations = await prisma.recommendation.findMany({
      orderBy: {
          createdAt: "desc"
      },
      take: 15
  });

  return (
    <div className="w-10/12 max-w-7xl ml-auto mr-auto mt-8">
      <h1 className="text-4xl sm:text-5xl text-center p-4 pr-0 pl-0 break-all hyphens-auto">Song suggestions</h1>
      <p className="text-center">If you have any song suggestions please leave a Spotify link below</p>
      <p></p>

      <Form/>

      <div className="recommendations sm:w-10/12 mt-16">
        <h1 className="text-4xl">Latest recommendations</h1>
        {recommendations.map(recommendation => (
            <div className="recommendation flex flex-col sm:flex-row space-x-4 p-4 mb-4 mt-1" key={recommendation.id}>
                <img className="w-full sm:w-48 rounded-xl" src={recommendation.imageLink} alt="album cover" />

                <div className="info">
                  <a href={recommendation.link}><h1 className="text-4xl sm:text-2xl text-main" key={recommendation.id}>{recommendation.name}</h1></a>
                  <p>{recommendation.artist.join(", ")}</p>
                  <p className='italic before:content-["] after:content-["]'>{recommendation.comment}</p>
                  <div className="genres flex h-8 space-x-2 items-center mt-8">
                    {recommendation.genres.map(genre => (
                      <div key={genre} className="bg-main w-fit p-2 pt-1 pb-1 rounded-xl">
                        <p>{genre}</p>
                      </div>
                    ))}
                  </div>
                </div>
              
            </div>
        ))}
      </div>
    </div>
  );
}