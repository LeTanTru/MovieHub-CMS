'use client';

import {
  BooleanField,
  Col,
  InputField,
  Row,
  SelectField,
  TextAreaField
} from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { Modal } from '@/components/modal';
import {
  apiConfig,
  DEFAULT_TABLE_PAGE_START,
  MAX_PAGE_SIZE,
  permissionErrorMaps
} from '@/constants';
import { useSaveBase } from '@/hooks';
import { useGroupPermissionListQuery } from '@/queries';
import { permissionSchema } from '@/schemaValidations';
import type {
  GroupPermissionResType,
  PermissionBodyType,
  PermissionResType
} from '@/types';
import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';

type PermissionModalProps = {
  open: boolean;
  queryKey: string;
  selectedRow: PermissionResType | null;
  selectedGroupPermissionId: string;
  onClose: () => void;
};

export default function PermissionModal({
  open,
  queryKey,
  selectedRow,
  selectedGroupPermissionId,
  onClose
}: PermissionModalProps) {
  const {
    isEditing,
    isFormChanged,
    onFormChange,
    handleSubmit,
    renderActions
  } = useSaveBase<PermissionResType, PermissionBodyType>({
    apiConfig: apiConfig.permission,
    options: {
      queryKey,
      objectName: 'quyền',
      pathParams: {
        id: selectedRow?.id
      },
      mode: selectedRow === null ? 'create' : 'edit'
    },
    override: (handlers) => {
      handlers.handleSubmitSuccess = () => {
        onClose();
      };
    }
  });

  const { data: groupPermissionListData } = useGroupPermissionListQuery({
    page: DEFAULT_TABLE_PAGE_START,
    size: MAX_PAGE_SIZE
  });

  const groupPermissions: GroupPermissionResType[] = useMemo(() => {
    return groupPermissionListData?.data?.content || [];
  }, [groupPermissionListData?.data?.content]);

  const defaultValues: PermissionBodyType = {
    name: '',
    description: '',
    groupPermissionId: selectedGroupPermissionId,
    permissionCode: '',
    action: '',
    showMenu: false
  };

  const initialValues: PermissionBodyType = useMemo(
    () => ({
      description: selectedRow?.description ?? '',
      name: selectedRow?.name ?? '',
      groupPermissionId: isEditing
        ? (selectedRow?.groupPermission?.id ?? '')
        : selectedGroupPermissionId,
      permissionCode: selectedRow?.permissionCode ?? '',
      action: selectedRow?.action ?? '',
      showMenu: selectedRow?.showMenu ?? false
    }),
    [isEditing, selectedGroupPermissionId, selectedRow]
  );

  const onSubmit = async (
    values: PermissionBodyType,
    form: UseFormReturn<PermissionBodyType>
  ) => {
    await handleSubmit(values, form, permissionErrorMaps);
  };

  const handleClose = () => {
    onFormChange(false);
    onClose();
  };

  return (
    <Modal
      title={`${!isEditing ? 'Thêm' : 'Cập nhật'} quyền`}
      open={open}
      onClose={handleClose}
      bodyWrapperClassName='w-200'
      confirmOnClose={isFormChanged}
    >
      <BaseForm
        defaultValues={defaultValues}
        initialValues={initialValues}
        onSubmit={onSubmit}
        schema={permissionSchema}
        onFormChange={onFormChange}
      >
        {(form) => (
          <>
            <Row>
              <Col className='grid-c-6'>
                <SelectField
                  name='groupPermissionId'
                  control={form.control}
                  options={
                    groupPermissions.map((gp) => ({
                      label: gp.name,
                      value: gp.id.toString()
                    })) || []
                  }
                  getLabel={(opt) => opt.label}
                  getValue={(opt) => opt.value.toString()}
                  label='Nhóm quyền'
                  required
                  disabled={isEditing}
                  placeholder='Chọn nhóm quyền'
                />
              </Col>
              <Col className='grid-c-6'>
                <InputField
                  control={form.control}
                  name='name'
                  label='Tên quyền'
                  placeholder='Nhập tên quyền'
                  required
                  allowCustomInput
                  options={[
                    'List',
                    'Get',
                    'Create',
                    'Update',
                    'Delete',
                    'Update ordering'
                  ]}
                />
              </Col>
            </Row>
            <Row>
              <Col className='grid-c-6'>
                <InputField
                  control={form.control}
                  name='permissionCode'
                  label='Mã quyền'
                  placeholder='Mã quyền'
                  required
                />
              </Col>
              <Col className='grid-c-6'>
                <InputField
                  control={form.control}
                  name='action'
                  label='Hành động'
                  placeholder='Hành động'
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col className='grid-c-6'>
                <BooleanField
                  control={form.control}
                  name='showMenu'
                  label='Hiển thị trên menu'
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col className='grid-c-12'>
                <TextAreaField
                  control={form.control}
                  name='description'
                  label='Mô tả'
                  placeholder='Nhập mô tả'
                  required
                />
              </Col>
            </Row>
            <>{renderActions(form, { onCancel: handleClose })}</>
          </>
        )}
      </BaseForm>
    </Modal>
  );
}
