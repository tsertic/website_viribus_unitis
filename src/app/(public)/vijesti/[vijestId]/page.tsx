import Image from "next/image";
import { notFound } from "next/navigation";
import { Metadata } from "next";

import NewsSidebar from "@/components/vijesti/news-sidebar";
import { client } from "@/sanity/lib/client";
import { buildVijestQuery, vijestiPathsQuery } from "@/sanity/queries/vijesti";

import { formatISO, parseISO, format } from "date-fns";
import imageUrlBuilder from "@sanity/image-url";
const builder = imageUrlBuilder(client);
// Simulacija dohvaćanja podataka iz baze
async function getBlogPost(slug: string) {
  // U stvarnoj aplikaciji, ovdje biste dohvaćali podatke iz baze
  return {
    title: "Naslov blog posta",
    date: "2023-10-03",
    content: "Ovo je sadržaj blog posta...",
    image: "/placeholder.svg",
  };
}

async function getLatestNews() {
  // Simulacija dohvaćanja najnovijih vijesti
  return [
    { id: 1, title: "Najnovija vijest 1", link: "/news/1" },
    { id: 2, title: "Najnovija vijest 2", link: "/news/2" },
    // ... dodajte još vijesti
  ];
}

async function getLatestEvents() {
  // Simulacija dohvaćanja najnovijih događanja
  return [
    { id: 1, title: "Najnoviji događaj 1", link: "/events/1" },
    { id: 2, title: "Najnoviji događaj 2", link: "/events/2" },
    // ... dodajte još događanja
  ];
}

/* export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getBlogPost(params.slug);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.content.substring(0, 160),
    openGraph: {
      title: post.title,
      description: post.content.substring(0, 160),
      images: [{ url: post.image }],
    },
  };
} */
export async function generateStaticParams() {
  // Important, use the plain Sanity Client here
  const posts = await client.fetch(vijestiPathsQuery, [], {
    next: {
      revalidate: 120,
    },
  });

  return posts;
}
export default async function BlogPost({
  params,
}: {
  params: { vijestId: string };
}) {
  /*  const post = await getBlogPost(params.slug); */
  const post = {
    image: "/images/hero-section/2.jpg",
    title: "Test Tile",
    date: "2022-05-22",
  };
  const vijestData = await client.fetch(buildVijestQuery(params.vijestId));
  const latestNews = await getLatestNews();
  const latestEvents = await getLatestEvents();
  console.log(vijestData);
  if (!vijestData) {
    notFound();
  }
  const { title, mainImage, author, publishedAt } = vijestData;
  const formatedDate = format(parseISO(publishedAt), "dd MM, yyyy");
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <main className="md:w-2/3">
          <article className="bg-white rounded-lg shadow-md overflow-hidden">
            <Image
              src={builder.image(mainImage).width(800).height(400).url()}
              alt={title}
              width={800}
              height={400}
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-2">{title}</h1>
              <p className="text-gray-600 mb-4">{post.date}</p>
              {/*  <BlogPostContent content={post.content} /> */}
            </div>
          </article>
        </main>
        <NewsSidebar />
      </div>
    </div>
  );
}