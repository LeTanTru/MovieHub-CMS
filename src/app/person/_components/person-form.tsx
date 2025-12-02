'use client';

import {
  Col,
  DatePickerField,
  InputField,
  MultiSelectField,
  RichTextField,
  Row,
  SelectField,
  UploadImageField
} from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { PageWrapper } from '@/components/layout';
import { CircleLoading } from '@/components/loading';
import {
  apiConfig,
  countryOptions,
  DATE_TIME_FORMAT,
  DEFAULT_DATE_FORMAT,
  ErrorCode,
  GENDER_MALE,
  genderOptions,
  personKinds,
  storageKeys,
  TAB_PERSON_KIND_ACTOR
} from '@/constants';
import { useSaveBase } from '@/hooks';
import { logger } from '@/logger';
import { useDeleteFileMutation, useUploadAvatarMutation } from '@/queries';
import { route } from '@/routes';
import { personSchema } from '@/schemaValidations';
import { PersonBodyType, PersonResType } from '@/types';
import {
  formatDate,
  getData,
  renderImageUrl,
  renderListPageUrl
} from '@/utils';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export default function PersonForm({ queryKey }: { queryKey: string }) {
  const kind = getData(storageKeys.ACTIVE_TAB_PERSON_KIND);
  const [avatarPath, setAvatarPath] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const { id } = useParams<{ id: string }>();

  const uploadImageMutation = useUploadAvatarMutation();
  const deleteImageMutation = useDeleteFileMutation();

  const {
    data,
    loading,
    isEditing,
    queryString,
    responseCode,
    handleSubmit,
    renderActions
  } = useSaveBase<PersonResType, PersonBodyType>({
    apiConfig: apiConfig.person,
    options: {
      queryKey,
      objectName: kind === TAB_PERSON_KIND_ACTOR ? 'diễn viên' : 'đạo diễn',
      listPageUrl: route.person.getList.path,
      pathParams: {
        id
      },
      mode: id === 'create' ? 'create' : 'edit'
    }
  });

  const defaultValues: PersonBodyType = {
    avatarPath: '',
    bio: '',
    country: '',
    dateOfBirth: '',
    gender: GENDER_MALE,
    kinds: [],
    name: '',
    otherName: ''
  };

  const initialValues: PersonBodyType = useMemo(() => {
    return {
      avatarPath: data?.avatarPath ?? '',
      bio: data?.bio ?? '',
      country: data?.country ?? '',
      dateOfBirth: formatDate(data?.dateOfBirth, DEFAULT_DATE_FORMAT),
      gender: data?.gender ?? GENDER_MALE,
      kinds: data?.kinds ?? [],
      name: data?.name ?? '',
      otherName: data?.otherName ?? ''
    };
  }, [data]);

  const deleteFiles = async (files: string[]) => {
    const validFiles = files.filter(Boolean);
    if (!validFiles.length) return;
    await Promise.all(
      validFiles.map((filePath) =>
        deleteImageMutation.mutateAsync({ filePath }).catch((err) => {
          logger.error('Failed to delete file:', filePath, err);
        })
      )
    );
  };

  const handleDeleteFiles = async () => {
    const filesToDelete = uploadedImages.slice(1);
    await deleteFiles(filesToDelete);
  };

  const onSubmit = async (values: PersonBodyType) => {
    const filesToDelete =
      data?.avatarPath && !avatarPath
        ? uploadedImages
        : uploadedImages.slice(0, uploadedImages.length - 1);

    await deleteFiles(filesToDelete.filter(Boolean));

    await handleSubmit({
      ...values,
      dateOfBirth: formatDate(
        values.dateOfBirth,
        DATE_TIME_FORMAT,
        DEFAULT_DATE_FORMAT
      ),
      avatarPath: avatarPath
    });
  };

  useEffect(() => {
    const url = data?.avatarPath || '';
    setAvatarPath(url);
    setUploadedImages(url ? [url] : []);
  }, [data?.avatarPath]);

  return (
    <PageWrapper
      breadcrumbs={[
        {
          label: kind === TAB_PERSON_KIND_ACTOR ? 'Diễn viên' : 'Đạo diễn',
          href: renderListPageUrl(route.person.getList.path, queryString)
        },
        {
          label: `${!isEditing ? 'Thêm mới' : 'Cập nhật'} ${kind === TAB_PERSON_KIND_ACTOR ? 'diễn viên' : 'đạo diễn'}`
        }
      ]}
      notFound={responseCode === ErrorCode.PERSON_ERROR_NOT_FOUND}
      notFoundContent={`Không tìm thấy ${kind === TAB_PERSON_KIND_ACTOR ? 'diễn viên' : 'đạo diễn'} này`}
    >
      <BaseForm
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        schema={personSchema}
        initialValues={initialValues}
      >
        {(form) => (
          <>
            <Row>
              <Col span={24}>
                <UploadImageField
                  value={renderImageUrl(avatarPath)}
                  loading={uploadImageMutation.isPending}
                  control={form.control}
                  name='avatarPath'
                  onChange={(url) => {
                    setAvatarPath(url);
                    setUploadedImages((prev) =>
                      url ? [...prev, url] : [...prev]
                    );
                  }}
                  size={150}
                  uploadImageFn={async (file: Blob) => {
                    const res = await uploadImageMutation.mutateAsync({ file });
                    return res.data?.filePath ?? '';
                  }}
                  deleteImageFn={
                    data?.avatarPath
                      ? undefined
                      : () =>
                          deleteImageMutation.mutateAsync({
                            filePath: avatarPath
                          })
                  }
                  label='Ảnh đại diện'
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <InputField
                  control={form.control}
                  name='name'
                  label='Họ tên'
                  placeholder='Họ tên'
                  required
                />
              </Col>
              <Col>
                <InputField
                  control={form.control}
                  name='otherName'
                  label='Nghệ danh'
                  placeholder='Nghệ danh'
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <DatePickerField
                  control={form.control}
                  name='dateOfBirth'
                  label='Ngày sinh'
                  placeholder='Ngày sinh'
                />
              </Col>
              <Col>
                <SelectField
                  options={genderOptions}
                  control={form.control}
                  name='gender'
                  label='Giới tính'
                  placeholder='Giới tính'
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <MultiSelectField
                  control={form.control}
                  name='kinds'
                  label='Vai trò'
                  placeholder='Vai trò'
                  required
                  options={personKinds}
                />
              </Col>
              <Col>
                <SelectField
                  options={countryOptions}
                  control={form.control}
                  name='country'
                  label='Quốc tịch'
                  placeholder='Quốc tịch'
                />
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <RichTextField
                  name='bio'
                  control={form.control}
                  label='Tiểu sử'
                  placeholder='Tiểu sử'
                />
              </Col>
            </Row>
            <>
              {renderActions(form, {
                onCancel: handleDeleteFiles
              })}
            </>
            {loading && (
              <div className='absolute inset-0 bg-white/80'>
                <CircleLoading className='stroke-dodger-blue mt-20 size-8' />
              </div>
            )}
          </>
        )}
      </BaseForm>
    </PageWrapper>
  );
}
