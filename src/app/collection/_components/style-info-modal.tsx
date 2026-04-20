'use client';

import { Col, ImageField, Row } from '@/components/form';
import { Modal } from '@/components/modal';
import { StyleResType } from '@/types';
import { renderImageUrl } from '@/utils';

type StyleInfoModalProps = {
  opened: boolean;
  onClose: () => void;
  style: StyleResType;
};

export default function StyleInfoModal({
  opened,
  onClose,
  style
}: StyleInfoModalProps) {
  return (
    <Modal open={opened} onClose={onClose} className='min-h-150 w-200'>
      <Modal.Header>Thông tin thiết kế</Modal.Header>
      <Modal.Body className='p-4'>
        <Row className='mb-0'>
          <Col className='grid-c-12'>
            <div className='flex items-center gap-2'>
              <span className='block text-sm font-bold text-gray-700'>
                Tên thiết kế:
              </span>
              <span className='text-gray-900'>{style.name}</span>
            </div>
          </Col>
        </Row>
        <Row className='mb-0'>
          <Col className='grid-c-12'>
            <div className='flex items-center gap-2'>
              <span className='block text-sm font-bold text-gray-700'>
                Loại:
              </span>
              <span className='text-gray-900'>{style.type}</span>
            </div>
          </Col>
        </Row>
        <Row className='mb-0'>
          <Col className='grid-c-6'>
            <span className='mb-1 block text-sm font-bold text-gray-700'>
              Ảnh Mobile:
            </span>
            {style.imageMobileUrl ? (
              <ImageField
                disablePreview={false}
                src={renderImageUrl(style.imageMobileUrl)}
                originalSize
                freeAspect
                freePreviewAspect
              />
            ) : (
              <span className='text-gray-500'>Không có ảnh</span>
            )}
          </Col>
          <Col className='grid-c-6'>
            <span className='mb-1 block text-sm font-bold text-gray-700'>
              Ảnh Web:
            </span>
            {style.imageWebUrl ? (
              <ImageField
                disablePreview={false}
                src={renderImageUrl(style.imageWebUrl)}
                originalSize
                freeAspect
                freePreviewAspect
              />
            ) : (
              <span className='text-gray-500'>Không có ảnh</span>
            )}
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
}
