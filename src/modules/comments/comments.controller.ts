export interface CommentType {
  _id: string;
  newsId: string;
  user: string;
  message: string;
  date: string;
  parentId?: string | null;
  replyCount?: number;
  replies?: CommentType[];
  likes?: number;
  dislikes?: number;
  userReaction?: 'like' | 'dislike' | null;
  isDeleted?: boolean;
  updatedAt?: string;
  isEdited?: boolean;
}
