import { News } from './news.model';
import { INews } from './news.interface';

interface GetNewsParams {
  page?: string;
  size?: string;
  sort?: 'createdAt_asc' | 'createdAt_desc';
}

export const getAllNews = async (params: GetNewsParams) => {
  const { page = '1', size = '10', sort = 'createdAt_desc' } = params;

  // Sorting
  const sortOptions: Record<string, 1 | -1> =
    sort === 'createdAt_asc' ? { createdAt: 1 } : { createdAt: -1 };

  // Pagination
  const pageNum = Math.max(parseInt(page, 10), 1);
  const sizeNum = Math.max(parseInt(size, 10), 1);

  // Queries
  const [news, total] = await Promise.all([
    News.find({})
      .sort(sortOptions)
      .skip((pageNum - 1) * sizeNum)
      .limit(sizeNum)
      .lean<INews[]>(),
    News.countDocuments(),
  ]);

  return {
    data: news,
    count: total,
  };
};

export const getNewsById = async (id: string) => {
  const news = await News.findById(id).lean();

  if (!news) {
    throw new Error('News not found');
  }
  return news;
};
export const NewsServices = {
  getAllNews,
  getNewsById,
};
