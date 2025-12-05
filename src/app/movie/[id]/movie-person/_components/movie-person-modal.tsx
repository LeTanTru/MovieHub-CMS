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
import {
  ApiResponseList,
  MoviePersonBodyType,
  MoviePersonResType,
  PersonResType
} from '@/types';
import { notify, renderImageUrl } from '@/utils';
import { UseQueryResult } from '@tanstack/react-query';
import { UseFormReturn } from 'react-hook-form';

export default function MoviePersonModal({
  moviePersonList,
  kind,
  movieId,
  open,
  listQuery,
  close
}: {
  moviePersonList?: MoviePersonResType[];
  movieId: string;
  kind: number;
  open: boolean;
  listQuery: UseQueryResult<ApiResponseList<MoviePersonResType>, Error>;
  close: () => void;
}) {
  const createMoviePersonMutation = useCreateMoviePersonMutation();

  const defaultValues: MoviePersonBodyType = {
    kind: kind,
    movieId: movieId,
    personId: '',
    characterName: '',
    ordering: Math.max(
      0,
      ...(moviePersonList?.map((item) => item.ordering) ?? [])
    )
  };

  const handleSubmit = async (
    values: MoviePersonBodyType,
    form: UseFormReturn<MoviePersonBodyType>
  ) => {
    await createMoviePersonMutation.mutateAsync(values, {
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
        logger.error(`Error while creating movie person: ${error}`);
        notify.error('Có lỗi xảy ra');
      }
    });
  };

  return (
    <Modal
      title={`Thêm ${kind === PERSON_KIND_ACTOR ? 'diễn viên' : 'đạo diễn'}`}
      open={open}
      onClose={close}
      className='[&_.content]:-top-[30%] [&_.content]:w-200'
    >
      <BaseForm
        defaultValues={defaultValues}
        schema={moviePersonSchema}
        onSubmit={handleSubmit}
        className='w-full'
      >
        {(form) => (
          <>
            <Row>
              <Col span={24}>
                <AutoCompleteField<any, PersonResType>
                  apiConfig={apiConfig.person.autoComplete}
                  control={form.control}
                  mappingData={(item: PersonResType) => {
                    if (
                      moviePersonList?.find((mvp) => mvp.person.id === item.id)
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
                      <div className='flex items-center gap-x-2'>
                        <AvatarField
                          src={renderImageUrl(opt.extra?.avatarPath)}
                          disablePreview
                        />
                        <span>{opt.extra?.otherName}</span>
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
          </>
        )}
      </BaseForm>
    </Modal>
  );
}
