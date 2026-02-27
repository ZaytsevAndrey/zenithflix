import type { ContentItem } from "@/types/content";

function pexelsWide(photoId: number, width: number): string {
  const height = Math.round((width * 9) / 16);
  return `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=${width}&h=${height}&fit=crop`;
}

const PEXELS_PHOTOS = [
  33129,   // popcorn movie
  274937,  // cinema/theater
  1482803, // film
  7991579, // woman in theater
  7513412, // people in movie theater
  8583821, // home cinema
  3811867, // popcorn TV
  1040158, // popcorn remote
  7991500, // woman theater
  265722,  // cinema
] as const;

export const TRENDING_MOCK: ContentItem[] = [
  {
    id: 1,
    title: "Inception",
    year: 2010,
    genre: ["Sci-Fi", "Thriller"],
    rating: 8.8,
    thumbnail: pexelsWide(PEXELS_PHOTOS[0], 400),
    backdrop: pexelsWide(PEXELS_PHOTOS[0], 780),
    duration: 148,
    description:
      "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    cast: ["Leonardo DiCaprio", "Marion Cotillard", "Tom Hardy"],
  },
  {
    id: 2,
    title: "Dune",
    year: 2021,
    genre: ["Sci-Fi", "Adventure"],
    rating: 8.0,
    thumbnail: pexelsWide(PEXELS_PHOTOS[1], 400),
    backdrop: pexelsWide(PEXELS_PHOTOS[1], 780),
    duration: 155,
    description:
      "Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding.",
    cast: ["Timothée Chalamet", "Rebecca Ferguson", "Oscar Isaac"],
  },
  {
    id: 3,
    title: "The Dark Knight",
    year: 2008,
    genre: ["Action", "Crime", "Drama"],
    rating: 9.0,
    thumbnail: pexelsWide(PEXELS_PHOTOS[2], 400),
    backdrop: pexelsWide(PEXELS_PHOTOS[2], 780),
    duration: 152,
    description:
      "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.",
    cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
  },
  {
    id: 4,
    title: "Interstellar",
    year: 2014,
    genre: ["Sci-Fi", "Drama", "Adventure"],
    rating: 8.7,
    thumbnail: pexelsWide(PEXELS_PHOTOS[3], 400),
    backdrop: pexelsWide(PEXELS_PHOTOS[3], 780),
    duration: 169,
    description:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
  },
  {
    id: 5,
    title: "Parasite",
    year: 2019,
    genre: ["Comedy", "Drama", "Thriller"],
    rating: 8.5,
    thumbnail: pexelsWide(PEXELS_PHOTOS[4], 400),
    backdrop: pexelsWide(PEXELS_PHOTOS[4], 780),
    duration: 132,
    description:
      "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    cast: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong"],
  },
  {
    id: 6,
    title: "Oppenheimer",
    year: 2023,
    genre: ["Biography", "Drama", "History"],
    rating: 8.3,
    thumbnail: pexelsWide(PEXELS_PHOTOS[5], 400),
    backdrop: pexelsWide(PEXELS_PHOTOS[5], 780),
    duration: 180,
    description:
      "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
    cast: ["Cillian Murphy", "Emily Blunt", "Matt Damon"],
  },
  {
    id: 7,
    title: "The Shawshank Redemption",
    year: 1994,
    genre: ["Drama"],
    rating: 8.7,
    thumbnail: pexelsWide(PEXELS_PHOTOS[6], 400),
    backdrop: pexelsWide(PEXELS_PHOTOS[6], 780),
    duration: 142,
    description:
      "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    cast: ["Tim Robbins", "Morgan Freeman", "Bob Gunton"],
  },
  {
    id: 8,
    title: "Everything Everywhere All at Once",
    year: 2022,
    genre: ["Sci-Fi", "Comedy", "Drama"],
    rating: 7.9,
    thumbnail: pexelsWide(PEXELS_PHOTOS[7], 400),
    backdrop: pexelsWide(PEXELS_PHOTOS[7], 780),
    duration: 139,
    description:
      "A middle-aged Chinese immigrant is swept up in an insane adventure in which she alone can save existence by exploring other universes.",
    cast: ["Michelle Yeoh", "Stephanie Hsu", "Ke Huy Quan"],
  },
  {
    id: 9,
    title: "Pulp Fiction",
    year: 1994,
    genre: ["Crime", "Drama"],
    rating: 8.9,
    thumbnail: pexelsWide(PEXELS_PHOTOS[8], 400),
    backdrop: pexelsWide(PEXELS_PHOTOS[8], 780),
    duration: 154,
    description:
      "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.",
    cast: ["John Travolta", "Uma Thurman", "Samuel L. Jackson"],
  },
  {
    id: 10,
    title: "The Matrix",
    year: 1999,
    genre: ["Sci-Fi", "Action"],
    rating: 8.7,
    thumbnail: pexelsWide(PEXELS_PHOTOS[9], 400),
    backdrop: pexelsWide(PEXELS_PHOTOS[9], 780),
    duration: 136,
    description:
      "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
    cast: ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss"],
  },
];

function extendForPagination(base: ContentItem[], copies: number): ContentItem[] {
  const out: ContentItem[] = [...base];
  for (let c = 1; c < copies; c++) {
    const offset = c * 10;
    base.forEach((item, i) => {
      out.push({
        ...item,
        id: offset + i + 1,
        title: `${item.title} (${c + 1})`,
      });
    });
  }
  return out;
}

export const TRENDING_MOCK_PAGINATED = extendForPagination(TRENDING_MOCK, 4);
