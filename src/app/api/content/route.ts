import { NextResponse } from "next/server";
import { TRENDING_MOCK, TRENDING_MOCK_PAGINATED } from "@/data/mockContent";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? 1);

  await new Promise((r) => setTimeout(r, 600));

  const perPage = 10;
  const start = (page - 1) * perPage;
  const trending = TRENDING_MOCK_PAGINATED.slice(start, start + perPage);
  const totalPages = Math.ceil(TRENDING_MOCK_PAGINATED.length / perPage);

  const forYou = TRENDING_MOCK.slice(1, 7);
  const newReleases = TRENDING_MOCK.slice(5, 10);

  return NextResponse.json({
    pagination: {
      currentPage: page,
      totalPages,
      hasNext: page < totalPages,
      totalItems: TRENDING_MOCK_PAGINATED.length,
    },
    categories: {
      trending,
      forYou,
      newReleases,
    },
  });
}
