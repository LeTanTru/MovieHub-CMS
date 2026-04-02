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
  PERSON_KIND_ACTOR,
  PERSON_KIND_DIRECTOR,
  personKinds,
  queryKeys,
  storageKeys,
  TAB_PERSON_KIND_ACTOR,
  TAB_PERSON_KIND_DIRECTOR
} from '@/constants';
import { useFileUploadManager, useSaveBase } from '@/hooks';
import { useDeleteFileMutation, useUploadAvatarMutation } from '@/queries';
import { route } from '@/routes';
import { personSchema } from '@/schemaValidations';
import type { PersonBodyType, PersonResType } from '@/types';
import {
  formatDate,
  getData,
  renderImageUrl,
  renderListPageUrl
} from '@/utils';
import { useParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export default function PersonForm() {
  const { id } = useParams<{ id: string }>();
  const kind = getData(storageKeys.ACTIVE_TAB_PERSON_KIND);

  const { mutateAsync: uploadImageMutate, isPending: uploadImageLoading } =
    useUploadAvatarMutation();
  const { mutateAsync: deleteFileMutate } = useDeleteFileMutation();

  const {
    data,
    loading,
    isEditing,
    queryString,
    responseCode,
    onFormChange,
    handleSubmit,
    renderActions
  } = useSaveBase<PersonResType, PersonBodyType>({
    apiConfig: apiConfig.person,
    options: {
      queryKey: queryKeys.PERSON,
      objectName: kind === TAB_PERSON_KIND_ACTOR ? 'diễn viên' : 'đạo diễn',
      listPageUrl: route.person.getList.path,
      pathParams: {
        id
      },
      mode: id === 'create' ? 'create' : 'edit'
    }
  });

  const imageManager = useFileUploadManager({
    initialUrl: data?.avatarPath,
    deleteFileMutate: deleteFileMutate,
    isEditing,
    onOpen: true
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

  const getKinds = useCallback(() => {
    const kinds = [];
    if (kind === TAB_PERSON_KIND_ACTOR) kinds.push(PERSON_KIND_ACTOR);
    if (kind === TAB_PERSON_KIND_DIRECTOR) kinds.push(PERSON_KIND_DIRECTOR);
    return kinds;
  }, [kind]);

  const initialValues: PersonBodyType = useMemo(
    () => ({
      avatarPath: data?.avatarPath ?? '',
      bio: data?.bio ?? '',
      country: data?.country ?? '',
      dateOfBirth: formatDate(data?.dateOfBirth, DEFAULT_DATE_FORMAT),
      gender: data?.gender ?? GENDER_MALE,
      kinds: data?.kinds ?? getKinds(),
      name: data?.name ?? '',
      otherName: data?.otherName ?? ''
    }),
    [
      data?.avatarPath,
      data?.bio,
      data?.country,
      data?.dateOfBirth,
      data?.gender,
      data?.kinds,
      data?.name,
      data?.otherName,
      getKinds
    ]
  );

  const handleCancel = async () => {
    await imageManager.handleCancel();
  };

  const onSubmit = async (values: PersonBodyType) => {
    await Promise.all([
      imageManager.handleSubmit(),
      handleSubmit({
        ...values,
        dateOfBirth: values.dateOfBirth
          ? formatDate(
              values.dateOfBirth,
              DATE_TIME_FORMAT,
              DEFAULT_DATE_FORMAT
            )
          : null,
        avatarPath: imageManager.currentUrl
      })
    ]);
  };

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
        onFormChange={onFormChange}
      >
        {(form) => (
          <>
            <Row>
              <Col className='grid-c-12'>
                <UploadImageField
                  value={renderImageUrl(imageManager.currentUrl)}
                  loading={uploadImageLoading}
                  control={form.control}
                  name='avatarPath'
                  onChange={imageManager.trackUpload}
                  size={120}
                  uploadImageFn={async (file: Blob) => {
                    const res = await uploadImageMutate({ file });
                    return res.data?.filePath ?? '';
                  }}
                  deleteImageFn={imageManager.handleDeleteOnClick}
                  label='Ảnh đại diện'
                  avatar
                />
              </Col>
            </Row>
            <Row>
              <Col className='grid-c-6'>
                <InputField
                  control={form.control}
                  name='name'
                  label='Họ tên'
                  placeholder='Họ tên'
                  required
                />
              </Col>
              <Col className='grid-c-6'>
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
              <Col className='grid-c-6'>
                <DatePickerField
                  control={form.control}
                  name='dateOfBirth'
                  label='Ngày sinh'
                  placeholder='Ngày sinh'
                />
              </Col>
              <Col className='grid-c-6'>
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
              <Col className='grid-c-6'>
                <MultiSelectField
                  control={form.control}
                  name='kinds'
                  label='Vai trò'
                  placeholder='Vai trò'
                  required
                  options={personKinds}
                />
              </Col>
              <Col className='grid-c-6'>
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
              <Col className='grid-c-12'>
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
                onCancel: handleCancel
              })}
            </>
            {loading && (
              <div className='absolute inset-0 z-10 flex justify-center bg-white/80'>
                <CircleLoading className='stroke-main-color mt-20' />
              </div>
            )}
          </>
        )}
      </BaseForm>
    </PageWrapper>
  );
}
