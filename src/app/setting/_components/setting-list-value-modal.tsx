'use client';

import { Modal } from '@/components/modal';
import { Input } from '@/components/ui/input';

type SettingListValueModalProps = {
  open: boolean;
  value: string;
  onClose: () => void;
};

export function SettingListValueModal({
  open,
  value,
  onClose
}: SettingListValueModalProps) {
  const items = value ? value.split(';').filter(Boolean) : [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby='setting-list-value-modal-title'
      className='top-1/2 left-1/2 mx-0 min-h-[50vh] w-200 -translate-x-1/2 -translate-y-1/2'
    >
      <Modal.Header>Danh sách từ khóa</Modal.Header>
      <Modal.Body scrollable>
        {items.length === 0 ? (
          <p className='text-muted-foreground text-sm'>Chưa có từ nào</p>
        ) : (
          <div className='grid grid-cols-2 gap-3 overflow-y-auto p-4'>
            {items.map((item, index) => (
              <Input
                key={index}
                value={item}
                readOnly
                className='focus-visible:ring-sporty-blue text-sm font-normal shadow-none transition-all duration-200 ease-linear placeholder:text-gray-300 focus-visible:border-transparent focus-visible:ring-2'
              />
            ))}
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}
