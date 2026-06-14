'use client';

import { AutoCompleteField, AvatarField, Col, Row } from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { Modal } from '@/components/modal';
import {
  apiConfig,
  INITIAL_AUTO_COMPLETE_SIZE,
  PERSON_KIND_ACTOR
} from '@/constants';
import { logger } from '@/logger';
import { useCreateMoviePersonMutation } from '@/queries';
import { moviePersonSchema } from '@/schemaValidations';
import type {
  ApiResponseList,
  MoviePersonBodyType,
  MoviePersonResType,
  PersonResType
} from '@/types';
import { getLastWord, notify, renderImageUrl } from '@/utils';
import { UseQueryResult } from '@tanstack/react-query';
import type { UseFormReturn } from 'react-hook-form';
import { useState } from 'react';
import { CircleLoading } from '@/components/loading';

type MoviePersonModalProps = {
  moviePersonList?: MoviePersonResType[];
  movieId: string;
  kind: number;
  open: boolean;
  listQuery: UseQueryResult<ApiResponseList<MoviePersonResType>, Error>;
  onClose: () => void;
};

export function MoviePersonModal({
  moviePersonList,
  kind,
  movieId,
  open,
  listQuery,
  onClose
}: MoviePersonModalProps) {
  const {
    mutate: createMoviePersonMutate,
    isPending: createMoviePersonLoading
  } = useCreateMoviePersonMutation();
  const [isFormChanged, setIsFormChanged] = useState<boolean>(false);

  const defaultValues: MoviePersonBodyType = {
    kind: kind,
    movieId: movieId,
    personId: '',
    characterName: ''
  };

  const handleSubmit = (
    values: MoviePersonBodyType,
    form: UseFormReturn<MoviePersonBodyType>
  ) => {
    createMoviePersonMutate(values, {
      onSuccess: (res) => {
        if (res.result) {
          notify.success(
            `Thêm ${kind === PERSON_KIND_ACTOR ? 'diễn viên' : 'đạo diễn'} thành công`
          );
          listQuery.refetch();
          form.reset();
        } else {
          notify.error(
            `Thêm ${kind === PERSON_KIND_ACTOR ? 'diễn viên' : 'đạo diễn'} thất bại`
          );
        }
      },
      onError: (error) => {
        logger.error('[CREATE_MOVIE_PERSON_ERROR]', error);
        notify.error(
          `Thêm ${kind === PERSON_KIND_ACTOR ? 'diễn viên' : 'đạo diễn'} thất bại`
        );
      }
    });
  };

  const handleClose = () => {
    onClose();
    setIsFormChanged(false);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      className='overflow-hidden'
      aria-labelledby='video-modal-title'
      confirmOnClose={isFormChanged}
    >
      <Modal.Header>
        {`Thêm ${kind === PERSON_KIND_ACTOR ? 'diễn viên' : 'đạo diễn'}`}
      </Modal.Header>
      <Modal.Body className='overflow-hidden'>
        <BaseForm
          defaultValues={defaultValues}
          schema={moviePersonSchema}
          onSubmit={handleSubmit}
          onFormChange={(changed) => setIsFormChanged(changed)}
          className='rounded-none'
        >
          {(form) => (
            <>
              <Row>
                <Col className='grid-c-12'>
                  <AutoCompleteField
                    apiConfig={apiConfig.person.autoComplete}
                    control={form.control}
                    mappingData={(item: PersonResType) => {
                      if (
                        moviePersonList?.find(
                          (mvp) => mvp.person.id === item.id
                        )
                      )
                        return null;
                      return {
                        label: item.otherName,
                        value: item.id.toString()
                      };
                    }}
                    name='personId'
                    initialParams={{
                      kind,
                      size:
                        INITIAL_AUTO_COMPLETE_SIZE +
                        (moviePersonList?.length ?? 0)
                    }}
                    searchParams={['otherName']}
                    label={`${kind === PERSON_KIND_ACTOR ? 'Diễn viên' : 'Đạo diễn'}`}
                    placeholder={`${kind === PERSON_KIND_ACTOR ? 'Diễn viên' : 'Đạo diễn'}`}
                    renderOption={(opt) => {
                      return (
                        <div className='flex items-center gap-2'>
                          <AvatarField
                            src={renderImageUrl(opt.extra?.avatarPath)}
                            disablePreview
                            alt={getLastWord(opt.extra?.name ?? '')}
                          />
                          <div className='flex flex-col justify-between'>
                            <span>{opt.extra?.otherName}</span>
                            <span className='text-xs text-gray-500'>
                              {opt.extra?.name}
                            </span>
                          </div>
                        </div>
                      );
                    }}
                    onValueChange={(value) =>
                      handleSubmit(
                        {
                          ...defaultValues,
                          personId: value as string
                        },
                        form
                      )
                    }
                  />
                </Col>
              </Row>
              {createMoviePersonLoading && (
                <div className='absolute inset-0 z-10 flex justify-center bg-white/80'>
                  <CircleLoading className='stroke-sporty-blue mt-10' />
                </div>
              )}
            </>
          )}
        </BaseForm>
      </Modal.Body>
      <Modal.Confirm message='Bạn có chắc chắn muốn hủy không ?' />
    </Modal>
  );
}
