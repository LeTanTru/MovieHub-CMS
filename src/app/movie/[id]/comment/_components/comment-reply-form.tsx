import { AnimatePresence, m } from 'framer-motion';
import type { CommentResType } from '@/types';
import { CommentForm } from './comment-form';

type CommentReplyFormProps = {
  comment: CommentResType & {
    children?: CommentResType[];
  };
  rootId: string;
  replyingComment: CommentResType | null;
  editingComment: CommentResType | null;
  onSubmitted: () => void;
  onCancel: () => void;
};

export function CommentReplyForm({
  comment,
  rootId,
  replyingComment,
  editingComment,
  onSubmitted,
  onCancel
}: CommentReplyFormProps) {
  return (
    <AnimatePresence initial={false}>
      {(replyingComment?.id === comment.id ||
        editingComment?.id === comment.id) && (
        <m.div
          key='reply'
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.1, ease: 'linear' }}
          className='mt-2'
        >
          <CommentForm
            parentId={rootId.toString()}
            movieId={comment.movieId.toString()}
            defaultMention={`@${comment.author.fullName}`}
            onSubmitted={onSubmitted}
            onCancel={onCancel}
          />
        </m.div>
      )}
    </AnimatePresence>
  );
}
