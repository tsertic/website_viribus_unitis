import Image from "next/image";
import { notFound } from "next/navigation";
import { Metadata } from "next";

import NewsSidebar from "@/components/vijesti/news-sidebar";
import { client } from "@/sanity/lib/client";
import { buildVijestQuery, vijestiPathsQuery } from "@/sanity/queries/vijesti";

import { formatISO, parseISO, format } from "date-fns";
import imageUrlBuilder from "@sanity/image-url";
import { formatDate } from "@/lib/utils";
import { CustomPortableTextComponents } from "@/components/sanity/CustomPortableTextComponents/CustomPortableTextComponents";
import { PortableText } from "@portabletext/react";
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

export async function generateMetadata({
  params,
}: {
  params: { vijestId: string };
}): Promise<Metadata> {
  const post = await client.fetch(buildVijestQuery(params.vijestId));

  if (!post) {
    return {};
  }
  const buildImage = builder.image(post.mainImage).width(400).height(400).url();
  return {
    title: post.title,
    description: post.previewText.substring(0, 160),
    openGraph: {
      title: post.title,
      description: post.previewText.substring(0, 160),
      images: [{ url: buildImage }],
    },
  };
}
export async function generateStaticParams() {
  // Important, use the plain Sanity Client here
  const posts = await client.fetch(vijestiPathsQuery, [], {
    next: {
      revalidate: 120,
    },
  });
  const mappedPosts = posts.map((item: { params: { vijestId: string } }) => ({
    vijestId: item.params.vijestId,
  }));

  return mappedPosts;
}
export default async function BlogPost({
  params,
}: {
  params: { vijestId: string };
}) {
  /*  const post = await getBlogPost(params.slug); */

  const vijestData = await client.fetch(buildVijestQuery(params.vijestId));

  if (!vijestData) {
    notFound();
  }
  const { title, mainImage, author, publishedAt, body } = vijestData;
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
              <p className="text-gray-600 mb-4">{formatDate(publishedAt)}</p>
              <div>
                <PortableText
                  value={body}
                  components={CustomPortableTextComponents}
                />
              </div>
            </div>
          </article>
        </main>
        <NewsSidebar />
      </div>
    </div>
  );
}
