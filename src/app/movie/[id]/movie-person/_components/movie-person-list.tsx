'use client';

import MoviePersonModal from '@/app/movie/[id]/movie-person/_components/movie-person-modal';
import { AvatarField, Button, InputField, ToolTip } from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { HasPermission } from '@/components/has-permission';
import { ListPageWrapper } from '@/components/layout';
import { DragDropTable } from '@/components/table';
import { Separator } from '@/components/ui/separator';
import { apiConfig, MAX_PAGE_SIZE, PERSON_KIND_ACTOR } from '@/constants';
import { useDisclosure, useDragDrop, useListBase } from '@/hooks';
import { logger } from '@/logger';
import { useUpdateMoviePersonMutation } from '@/queries';
import { moviePersonSearchSchema } from '@/schemaValidations';
import {
  Column,
  MoviePersonResType,
  MoviePersonSearchType,
  SearchFormProps
} from '@/types';
import { notify, renderImageUrl } from '@/utils';
import { PlusIcon, Save, X } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  AiOutlineClear,
  AiOutlineEdit,
  AiOutlineSave,
  AiOutlineUser
} from 'react-icons/ai';
import z from 'zod';

export default function MoviePersonList({
  queryKey,
  kind
}: {
  queryKey: string;
  kind: number;
}) {
  const { id: movieId } = useParams<{ id: string }>();

  const [selectedRow, setSelectedRow] = useState<string>('');
  const [characterNames, setCharacterNames] = useState<Record<string, string>>(
    {}
  );
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const moviePersonModal = useDisclosure(false);

  const updateMoviePersonMutation = useUpdateMoviePersonMutation();

  const { data, loading, handlers, listQuery } = useListBase<
    MoviePersonResType,
    MoviePersonSearchType
  >({
    apiConfig: apiConfig.moviePerson,
    options: {
      queryKey,
      objectName: kind === PERSON_KIND_ACTOR ? 'diễn viên' : 'đạo diễn',
      defaultFilters: { kind, movieId },
      notShowFromSearchParams: ['kind', 'movieId']
    },
    override: (handlers) => {
      handlers.additionalParams = () => ({
        size: MAX_PAGE_SIZE
      });
      handlers.renderAddButton = () => {
        return (
          <HasPermission
            requiredPermissions={[apiConfig.moviePerson.create.permissionCode]}
          >
            <Button onClick={() => moviePersonModal.open()} variant={'primary'}>
              <PlusIcon />
              Thêm {kind === PERSON_KIND_ACTOR ? 'diễn viên' : 'đạo diễn'}
            </Button>
          </HasPermission>
        );
      };
      handlers.additionalColumns = () => ({
        edit: (
          record: MoviePersonResType,
          buttonProps?: Record<string, any>
        ) => {
          if (
            !handlers.hasPermission({
              requiredPermissions: [apiConfig.moviePerson.update.permissionCode]
            })
          )
            return null;

          const isEditing = selectedRow === record.id;

          return (
            <ToolTip
              title={
                isEditing
                  ? 'Lưu'
                  : `Sửa ${kind === PERSON_KIND_ACTOR ? 'diễn viên' : 'đạo diễn'}`
              }
              sideOffset={0}
            >
              <span>
                <Button
                  onClick={() => {
                    if (isEditing) {
                      const form = document.getElementById(
                        `character-form-${record.id}`
                      ) as HTMLFormElement;
                      form?.requestSubmit();
                    } else {
                      setSelectedRow(record.id);
                    }
                  }}
                  className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                  {...buttonProps}
                >
                  {isEditing ? (
                    <AiOutlineSave className='text-dodger-blue size-4' />
                  ) : (
                    <AiOutlineEdit className='text-dodger-blue size-4' />
                  )}
                </Button>
              </span>
            </ToolTip>
          );
        }
      });
    }
  });

  const {
    sortColumn,
    loading: loadingUpdateOrdering,
    sortedData,
    isChanged,
    onDragEnd,
    handleUpdate
  } = useDragDrop<MoviePersonResType>({
    key: `${queryKey}-list`,
    objectName: kind === PERSON_KIND_ACTOR ? 'diễn viên' : 'đạo diễn',
    data,
    apiConfig: apiConfig.moviePerson.updateOrdering,
    sortField: 'ordering'
  });

  useEffect(() => {
    if (selectedRow && inputRefs.current[selectedRow]) {
      const input = inputRefs.current[selectedRow];
      setTimeout(() => {
        input?.focus();
        const val = input.value;
        input.setSelectionRange(val.length, val.length);
      }, 0);
    }
  }, [selectedRow]);

  useEffect(() => {
    const names: Record<string, string> = {};
    data.forEach((item) => {
      names[item.id] = item.characterName || '';
    });
    setCharacterNames(names);
  }, [data]);

  const handleUpdateCharacterName = async (
    record: MoviePersonResType,
    newCharacterName: string
  ) => {
    if (newCharacterName === record.characterName) {
      setSelectedRow('');
      return;
    }

    await updateMoviePersonMutation.mutateAsync(
      {
        id: record.id,
        kind: record.kind,
        characterName: newCharacterName
      },
      {
        onSuccess: (res) => {
          if (res.result) {
            notify.success('Cập nhật tên nhân vật thành công');
            setSelectedRow('');

            const updatedData = data.map((item) =>
              item.id === record.id
                ? { ...item, characterName: newCharacterName }
                : item
            );
            handlers.setData(updatedData);
          }
        },
        onError: (error) => {
          logger.error(`Error while updating character name: ${error}`);
          notify.success('Có lỗi xảy ra');
        }
      }
    );
  };

  const columns: Column<MoviePersonResType>[] = [
    ...(sortedData.length > 1 ? [sortColumn] : []),
    {
      title: '#',
      dataIndex: ['person', 'avatarPath'],
      width: 80,
      align: 'center',
      render: (value) => (
        <AvatarField
          size={50}
          zoomSize={500}
          disablePreview={!value}
          src={renderImageUrl(value)}
          className='rounded'
          previewClassName='rounded'
          icon={<AiOutlineUser className='size-7 text-slate-800' />}
        />
      )
    },
    {
      title: kind === PERSON_KIND_ACTOR ? 'Tên diễn viên' : 'Tên đạo diễn',
      render: (_, record) => (
        <>
          <span
            className='line-clamp-1 block truncate'
            title={`${record.person.otherName}`}
          >
            {record.person.otherName}
          </span>
          <span
            className='line-clamp-1 block truncate text-xs text-zinc-500'
            title={`${record.person.name}`}
          >
            {record.person.name}
          </span>
        </>
      )
    },
    ...(kind === PERSON_KIND_ACTOR
      ? [
          {
            title: 'Tên nhân vật',
            width: 500,
            render: (_: any, record: MoviePersonResType) => {
              const currentName = characterNames[record.id] || '';

              return (
                <BaseForm
                  defaultValues={{ characterName: '' }}
                  initialValues={{ characterName: currentName }}
                  schema={z.object({
                    characterName: z.string().optional().nullable()
                  })}
                  onSubmit={(values) =>
                    handleUpdateCharacterName(record, values.characterName)
                  }
                  className='w-full bg-transparent px-0'
                  id={`character-form-${record.id}`}
                >
                  {(form) => (
                    <div className='flex w-full items-center gap-x-2'>
                      <InputField
                        control={form.control}
                        name='characterName'
                        placeholder='Nhập tên nhân vật'
                        className='h-8 text-sm'
                        formItemClassName='flex-1'
                        disabled={selectedRow !== record.id}
                        ref={(el: HTMLInputElement | null) => {
                          if (el) {
                            inputRefs.current[record.id] = el;
                          }
                        }}
                        onChange={(e) =>
                          setCharacterNames((prev) => ({
                            ...prev,
                            [record.id]: e.target.value
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && selectedRow === record.id) {
                            e.preventDefault();
                            form.handleSubmit((values) =>
                              handleUpdateCharacterName(
                                record,
                                values.characterName || ''
                              )
                            )();
                          } else if (e.key === 'Escape') {
                            form.reset({ characterName: record.characterName });
                            setCharacterNames((prev) => ({
                              ...prev,
                              [record.id]: record.characterName || ''
                            }));
                            setSelectedRow('');
                          }
                        }}
                      />
                      <div className='flex items-center'>
                        <ToolTip title='Xóa' sideOffset={0}>
                          <Button
                            variant={'ghost'}
                            type='button'
                            className='h-8! w-8! p-0!'
                            onClick={() => {
                              form.setValue('characterName', '');
                              setCharacterNames((prev) => ({
                                ...prev,
                                [record.id]: ''
                              }));
                            }}
                            disabled={selectedRow !== record.id}
                          >
                            <AiOutlineClear className='text-dodger-blue' />
                          </Button>
                        </ToolTip>
                        <Separator
                          orientation='vertical'
                          className='h-4! w-px!'
                        />
                        <ToolTip title='Hủy' sideOffset={0}>
                          <Button
                            variant={'ghost'}
                            type='button'
                            className='h-8! w-8! p-0!'
                            onClick={() => {
                              form.reset({
                                characterName: record.characterName
                              });
                              setCharacterNames((prev) => ({
                                ...prev,
                                [record.id]: record.characterName || ''
                              }));
                              setSelectedRow('');
                            }}
                            disabled={selectedRow !== record.id}
                          >
                            <X className='text-destructive' />
                          </Button>
                        </ToolTip>
                      </div>
                    </div>
                  )}
                </BaseForm>
              );
            },
            align: 'center' as const
          }
        ]
      : []),
    handlers.renderActionColumn({
      actions: {
        edit: true,
        delete: true
      }
    })
  ];

  const searchFields: SearchFormProps<MoviePersonSearchType>['searchFields'] = [
    {
      key: 'personId',
      placeholder: kind === PERSON_KIND_ACTOR ? 'Tên diễn viên' : 'Tên đạo diễn'
    }
  ];

  return (
    <>
      <ListPageWrapper
        searchForm={handlers.renderSearchForm({
          searchFields,
          schema: moviePersonSearchSchema
        })}
        addButton={handlers.renderAddButton()}
        reloadButton={handlers.renderReloadButton()}
      >
        <DragDropTable
          columns={columns}
          dataSource={sortedData}
          loading={loading || loadingUpdateOrdering}
          onDragEnd={onDragEnd}
        />
        {sortedData.length > 1 && (
          <div className='mr-4 flex justify-end py-4'>
            <Button
              onClick={() => handleUpdate()}
              disabled={!isChanged || loading || loadingUpdateOrdering}
              className='w-40'
              variant={'primary'}
              loading={loading || loadingUpdateOrdering}
            >
              <Save />
              Cập nhật
            </Button>
          </div>
        )}
      </ListPageWrapper>
      <MoviePersonModal
        moviePersonList={data}
        kind={kind}
        open={moviePersonModal.opened}
        close={moviePersonModal.close}
        movieId={movieId}
        listQuery={listQuery}
      />
    </>
  );
}
