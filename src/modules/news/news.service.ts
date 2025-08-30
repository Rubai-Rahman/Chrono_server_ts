import { News } from './news.model';
import { INews } from './news.interface';

export const getAllNews = async (): Promise<INews[]> => {
  try {
    const mongooseData = await News.find({}).lean();
    return mongooseData;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    throw error;
  }
};

export const NewsServices = {
  getAllNews,
};
