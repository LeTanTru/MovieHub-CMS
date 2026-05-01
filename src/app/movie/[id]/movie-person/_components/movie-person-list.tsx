'use client';

import MoviePersonModal from './movie-person-modal';
import { AvatarField, Button, InputField, ToolTip } from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { HasPermission } from '@/components/has-permission';
import { ListPageWrapper } from '@/components/layout';
import { CircleLoading } from '@/components/loading';
import { DragDropTable } from '@/components/table';
import { Separator } from '@/components/ui/separator';
import {
  apiConfig,
  MAX_PAGE_SIZE,
  PERSON_KIND_ACTOR,
  queryKeys
} from '@/constants';
import { useDisclosure, useDragDrop, useListBase } from '@/hooks';
import { logger } from '@/logger';
import { useUpdateMoviePersonMutation } from '@/queries';
import { moviePersonSearchSchema } from '@/schemaValidations';
import type {
  Column,
  MoviePersonResType,
  MoviePersonSearchType,
  SearchFormProps
} from '@/types';
import { getLastWord, notify, renderImageUrl } from '@/utils';
import { PlusIcon, X } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AiOutlineClear, AiOutlineEdit, AiOutlineSave } from 'react-icons/ai';
import { z } from 'zod';

type MoviePersonListProps = { kind: number };

export default function MoviePersonList({ kind }: MoviePersonListProps) {
  const { id: movieId } = useParams<{ id: string }>();

  const [selectedRow, setSelectedRow] = useState<string>('');
  const [characterNames, setCharacterNames] = useState<Record<string, string>>(
    {}
  );
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const { opened, open, close } = useDisclosure();

  const {
    mutateAsync: updateMoviePersonMutate,
    isPending: updateMoviePersonLoading
  } = useUpdateMoviePersonMutation();

  const { data, loading, handlers, listQuery } = useListBase<
    MoviePersonResType,
    MoviePersonSearchType
  >({
    apiConfig: apiConfig.moviePerson,
    options: {
      queryKey: queryKeys.MOVIE_PERSON,
      objectName: kind === PERSON_KIND_ACTOR ? 'diễn viên' : 'đạo diễn',
      defaultFilters: { kind, movieId },
      notShowFromSearchParams: ['kind', 'movieId'],
      excludeFromQueryFilter: ['movieTitle']
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
            <Button onClick={open} variant='primary'>
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
          const isEditing = selectedRow === record.id;

          return (
            <ToolTip
              title={
                isEditing
                  ? 'Lưu'
                  : `Cập nhật ${kind === PERSON_KIND_ACTOR ? 'diễn viên' : 'đạo diễn'}`
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
                  {updateMoviePersonLoading && isEditing ? (
                    <CircleLoading className='stroke-main-color size-4' />
                  ) : isEditing ? (
                    <AiOutlineSave className='text-main-color size-4' />
                  ) : (
                    <AiOutlineEdit className='text-main-color size-4' />
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
    onDragEnd
  } = useDragDrop<MoviePersonResType>({
    key: queryKeys.MOVIE_PERSON_LIST,
    objectName: kind === PERSON_KIND_ACTOR ? 'diễn viên' : 'đạo diễn',
    data,
    apiConfig: apiConfig.moviePerson.updateOrdering,
    sortField: 'ordering',
    updateOnDragEnd: true
  });

  useEffect(() => {
    if (selectedRow && inputRefs.current[selectedRow]) {
      const input = inputRefs.current[selectedRow];
      const timer = setTimeout(() => {
        input?.focus();
        const val = input.value;
        input.setSelectionRange(val.length, val.length);
      }, 0);
      return () => clearTimeout(timer);
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

    if (!newCharacterName.trim() && !record.characterName) {
      setSelectedRow('');
      return;
    }

    const updatedData = data.map((item) =>
      item.id === record.id
        ? { ...item, characterName: newCharacterName }
        : item
    );
    handlers.setData(updatedData);

    await updateMoviePersonMutate(
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
          } else {
            notify.error('Cập nhật tên nhân vật thất bại');
            handlers.setData(data);
            setCharacterNames((prev) => ({
              ...prev,
              [record.id]: record.characterName || ''
            }));
          }
        },
        onError: (error) => {
          logger.error('[UPDATE_CHARACTER_NAME_ERROR]', error);
          notify.error('Cập nhật tên nhân vật thất bại');
          handlers.setData(data);
          setCharacterNames((prev) => ({
            ...prev,
            [record.id]: record.characterName || ''
          }));
        }
      }
    );
  };

  const columns: Column<MoviePersonResType>[] = [
    ...(sortedData.length > 1 &&
    handlers.hasPermission({
      requiredPermissions: [apiConfig.moviePerson.updateOrdering.permissionCode]
    })
      ? [sortColumn]
      : []),
    {
      title: '#',
      dataIndex: ['person', 'avatarPath'],
      width: 80,
      align: 'center',
      render: (value, record) => (
        <AvatarField
          disablePreview={!value}
          src={renderImageUrl(value)}
          size={45}
          alt={getLastWord(record.person.name)}
        />
      )
    },
    {
      title: kind === PERSON_KIND_ACTOR ? 'Tên diễn viên' : 'Tên đạo diễn',
      render: (_, record) => (
        <>
          <span
            className='line-clamp-1 block truncate'
            title={record.person.otherName}
          >
            {record.person.otherName}
          </span>
          <span
            className='line-clamp-1 block truncate text-xs text-zinc-500'
            title={record.person.name}
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
                  className='w-full bg-transparent p-0'
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
                            variant='ghost'
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
                            <AiOutlineClear className='text-main-color' />
                          </Button>
                        </ToolTip>
                        <Separator
                          orientation='vertical'
                          className='h-4! w-px!'
                        />
                        <ToolTip title='Hủy' sideOffset={0}>
                          <Button
                            variant='ghost'
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
        edit: handlers.hasPermission({
          requiredPermissions: [apiConfig.moviePerson.update.permissionCode]
        }),
        delete: handlers.hasPermission({
          requiredPermissions: [apiConfig.moviePerson.delete.permissionCode]
        })
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
      </ListPageWrapper>
      <MoviePersonModal
        moviePersonList={data}
        kind={kind}
        open={opened}
        onClose={close}
        movieId={movieId}
        listQuery={listQuery}
      />
    </>
  );
}
