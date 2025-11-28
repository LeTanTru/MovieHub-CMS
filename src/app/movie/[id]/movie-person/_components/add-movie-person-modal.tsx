'use client';

import { Modal } from '@/components/modal';
import { PERSON_KIND_ACTOR } from '@/constants';

export default function AddMoviePersonModal({
  open,
  kind,
  close
}: {
  open: boolean;
  kind: number;
  close: () => void;
}) {
  return (
    <Modal
      title={`Thêm ${kind === PERSON_KIND_ACTOR ? 'diễn viên' : 'đạo diễn'}`}
      open={open}
      onClose={close}
      className='[&_.content]:-top-[30%] [&_.content]:w-200'
    >
      123
    </Modal>
  );
}
