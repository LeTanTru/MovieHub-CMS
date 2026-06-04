'use client';

import {
  Button,
  Col,
  Row,
  TextAreaField,
  TimePickerField
} from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { Modal } from '@/components/modal';
import { subtitleSchema } from '@/schemaValidations';
import { SubtitleBodyType, SubtitleType } from '@/types';
import { ArrowLeftFromLine, Save } from 'lucide-react';
import { useMemo, useState } from 'react';

type SubtitleModalProps = {
  open: boolean;
  subtitle: SubtitleType;
  onClose: () => void;
};

export default function SubtitleModal({
  open,
  subtitle,
  onClose
}: SubtitleModalProps) {
  const [isFormChanged, setIsFormChanged] = useState<boolean>(false);

  const defaultValues: SubtitleBodyType = {
    start: '',
    end: '',
    text: ''
  };

  const initialValues: SubtitleBodyType = useMemo(
    () => ({
      start: subtitle.start,
      end: subtitle.end,
      text: subtitle.text
    }),
    [subtitle.end, subtitle.start, subtitle.text]
  );

  const onSubmit = (values: SubtitleBodyType) => {
    console.log('🚀 ~ onSubmit ~ values:', values);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Header>{subtitle ? 'Cập nhật' : 'Thêm'} phụ đề</Modal.Header>

      <Modal.Body>
        <BaseForm
          schema={subtitleSchema}
          defaultValues={defaultValues}
          initialValues={initialValues}
          onSubmit={onSubmit}
          onFormChange={setIsFormChanged}
        >
          {(form) => (
            <>
              <Row>
                <Col className='grid-c-6'>
                  <TimePickerField
                    control={form.control}
                    name='start'
                    label='Thời gian bắt đầu'
                    required
                  />
                </Col>
                <Col className='grid-c-6'>
                  <TimePickerField
                    control={form.control}
                    name='end'
                    label='Thời gian kết thúc'
                    required
                  />
                </Col>
              </Row>
              <Row>
                <Col className='grid-c-12'>
                  <TextAreaField
                    control={form.control}
                    name='text'
                    label='Nội dung phụ đề'
                    required
                    placeholder='Nhập nội dung phụ đề'
                  />
                </Col>
              </Row>
              <Row className='mb-0 justify-end'>
                <Col className='w-40'>
                  <Button
                    type='button'
                    variant='outline'
                    className='border-rose-500 text-rose-500 hover:border-rose-500/50 hover:text-rose-500/50'
                    onClick={onClose}
                  >
                    <ArrowLeftFromLine />
                    Hủy
                  </Button>
                </Col>
                <Col className='w-40'>
                  <Button
                    type='submit'
                    variant='primary'
                    disabled={!isFormChanged}
                  >
                    <Save />
                    {subtitle ? 'Cập nhật' : 'Thêm'}
                  </Button>
                </Col>
              </Row>
            </>
          )}
        </BaseForm>
      </Modal.Body>
    </Modal>
  );
}
