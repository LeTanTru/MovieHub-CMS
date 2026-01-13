'use client';

import { Activity } from '@/components/activity';
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

export default function PersonForm({ queryKey }: { queryKey: string }) {
  const { id } = useParams<{ id: string }>();
  const kind = getData(storageKeys.ACTIVE_TAB_PERSON_KIND);

  const uploadImageMutation = useUploadAvatarMutation();
  const deleteFileMutation = useDeleteFileMutation();

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

  const imageManager = useFileUploadManager({
    initialUrl: data?.avatarPath,
    deleteFileMutation: deleteFileMutation,
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

  const initialValues: PersonBodyType = useMemo(() => {
    return {
      avatarPath: data?.avatarPath ?? '',
      bio: data?.bio ?? '',
      country: data?.country ?? '',
      dateOfBirth: formatDate(data?.dateOfBirth, DEFAULT_DATE_FORMAT),
      gender: data?.gender ?? GENDER_MALE,
      kinds: data?.kinds ?? getKinds(),
      name: data?.name ?? '',
      otherName: data?.otherName ?? ''
    };
  }, [data, getKinds]);

  const handleCancel = async () => {
    await imageManager.handleCancel();
  };

  const onSubmit = async (values: PersonBodyType) => {
    await imageManager.handleSubmit();

    await handleSubmit({
      ...values,
      dateOfBirth: formatDate(
        values.dateOfBirth,
        DATE_TIME_FORMAT,
        DEFAULT_DATE_FORMAT
      ),
      avatarPath: imageManager.currentUrl
    });
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
      >
        {(form) => (
          <>
            <Row>
              <Col span={24}>
                <UploadImageField
                  value={renderImageUrl(imageManager.currentUrl)}
                  loading={uploadImageMutation.isPending}
                  control={form.control}
                  name='avatarPath'
                  onChange={imageManager.trackUpload}
                  size={150}
                  uploadImageFn={async (file: Blob) => {
                    const res = await uploadImageMutation.mutateAsync({ file });
                    return res.data?.filePath ?? '';
                  }}
                  deleteImageFn={imageManager.handleDeleteOnClick}
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
                onCancel: handleCancel
              })}
            </>
            <Activity visible={loading}>
              <div className='absolute inset-0 bg-white/80'>
                <CircleLoading className='stroke-dodger-blue mt-20 size-8' />
              </div>
            </Activity>
          </>
        )}
      </BaseForm>
    </PageWrapper>
  );
}
