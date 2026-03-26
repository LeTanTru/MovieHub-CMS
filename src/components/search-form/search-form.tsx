'use client';

import {
  AutoCompleteField,
  BooleanField,
  Button,
  Col,
  DateTimePickerField,
  InputField,
  MultiSelectField,
  Row,
  SelectField
} from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { FieldTypes } from '@/constants';
import type { ApiConfig, AutoCompleteOption, SearchFormProps } from '@/types';
import { BrushCleaning, Search } from 'lucide-react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

function buildDefaultValues<S extends FieldValues>(
  searchFields: SearchFormProps<S>['searchFields']
): Record<string, any> {
  return searchFields.reduce(
    (acc, field) => {
      if (!field.key) return acc;
      switch (field.type) {
        case FieldTypes.STRING:
          acc[field.key as string] = '';
          break;
        case FieldTypes.NUMBER:
          acc[field.key as string] = 0;
          break;
        case FieldTypes.SELECT:
        case FieldTypes.MULTI_SELECT:
        case FieldTypes.AUTO_COMPLETE:
          acc[field.key as string] = null;
          break;
        case FieldTypes.DATE:
        case FieldTypes.DATE_RANGE:
          acc[field.key as string] = null;
          break;
        case FieldTypes.BOOLEAN:
          acc[field.key as string] = null;
          break;
        default:
          acc[field.key as string] = '';
      }
      return acc;
    },
    {} as Record<string, any>
  );
}

export default function SearchForm<S extends FieldValues>({
  searchFields,
  schema,
  initialValues,
  handleSearchSubmit,
  handleSearchReset
}: SearchFormProps<S>) {
  const defaultValues: z.infer<typeof schema> =
    buildDefaultValues(searchFields);

  const onSubmit = (values: z.infer<typeof schema>) => {
    handleSearchSubmit(values);
  };

  const handleReset = (form: UseFormReturn<z.infer<typeof schema>>) => {
    handleSearchReset();
    form.reset(defaultValues);
  };

  const renderField = (
    searchFields: SearchFormProps<S>['searchFields'],
    form: UseFormReturn<Record<string, unknown>>
  ) => {
    return (
      <Row className='grid-row-no-gutters mb-0 w-full flex-nowrap justify-between gap-2'>
        <Col className='grid-col-no-gutters flex-1 flex-row'>
          <Row className='grid-row-no-gutters mb-0 grid w-full grid-cols-4 gap-2'>
            {searchFields.map((sf) => {
              switch (sf.type) {
                case FieldTypes.SELECT: {
                  return (
                    <Col key={sf.key as string} className='grid-col-no-gutters'>
                      <SelectField
                        control={form.control}
                        name={sf.key as string}
                        placeholder={sf.placeholder}
                        options={sf.options ?? []}
                        getLabel={(option) => option.label}
                        getValue={(option) => option.value}
                        onValueChange={(val) => {
                          if (sf.submitOnChanged) {
                            form.setValue(sf.key as string, val);
                            form.handleSubmit(onSubmit)();
                          }
                        }}
                      />
                    </Col>
                  );
                }
                case FieldTypes.MULTI_SELECT: {
                  return (
                    <Col key={sf.key as string} className='grid-col-no-gutters'>
                      <MultiSelectField
                        control={form.control}
                        name={sf.key as string}
                        placeholder={sf.placeholder}
                        options={sf.options ?? []}
                        getLabel={(option) => option.label}
                        getValue={(option) => option.value}
                        onValueChange={(val) => {
                          if (sf.submitOnChanged) {
                            form.setValue(sf.key as string, val);
                            form.handleSubmit(onSubmit)();
                          }
                        }}
                      />
                    </Col>
                  );
                }
                case FieldTypes.AUTO_COMPLETE: {
                  return (
                    <Col key={sf.key as string} className='grid-col-no-gutters'>
                      <AutoCompleteField
                        apiConfig={sf.apiConfig as ApiConfig}
                        control={form.control}
                        mappingData={
                          sf.mappingData as (
                            option: Record<string, any>
                          ) => AutoCompleteOption
                        }
                        name={sf.key as string}
                        searchParams={sf.searchParams as string[]}
                        initialParams={sf.initialParams}
                        placeholder={sf.placeholder}
                      />
                    </Col>
                  );
                }
                case FieldTypes.DATE: {
                  return (
                    <Col key={sf.key as string} className='grid-col-no-gutters'>
                      <DateTimePickerField
                        control={form.control}
                        name={sf.key as string}
                        placeholder={sf.placeholder}
                      />
                    </Col>
                  );
                }
                case FieldTypes.BOOLEAN: {
                  return (
                    <Col
                      key={sf.key as string}
                      className='grid-col-no-gutters items-center justify-center'
                    >
                      <BooleanField
                        control={form.control}
                        name={sf.key as string}
                        label={sf.placeholder}
                      />
                    </Col>
                  );
                }
                default: {
                  return (
                    <Col key={sf.key as string} className='grid-col-no-gutters'>
                      <InputField
                        control={form.control}
                        name={sf.key as string}
                        placeholder={sf.placeholder}
                      />
                    </Col>
                  );
                }
              }
            })}
            {!!searchFields.length && searchFields.length < 4 && (
              <Col className='grid-col-no-gutters w-auto shrink-0 flex-row space-x-2'>
                <Button type='submit' variant='primary'>
                  <Search />
                </Button>
                <Button
                  type='button'
                  onClick={() => handleReset(form)}
                  className='hover:[&>svg]:stroke-main-color hover:border-main-color border border-gray-300 bg-white hover:bg-transparent [&>svg]:stroke-black'
                >
                  <BrushCleaning className='transition-all duration-200 ease-linear' />
                </Button>
              </Col>
            )}
          </Row>
        </Col>
        {searchFields.length >= 4 && (
          <Col className='grid-col-no-gutters w-auto shrink-0 flex-row space-x-2'>
            <Button type='submit' variant='primary'>
              <Search />
            </Button>
            <Button
              type='button'
              onClick={() => handleReset(form)}
              className='hover:[&>svg]:stroke-main-color hover:border-main-color border border-gray-300 bg-white hover:bg-transparent [&>svg]:stroke-black'
            >
              <BrushCleaning className='transition-all duration-200 ease-linear' />
            </Button>
          </Col>
        )}
      </Row>
    );
  };

  return (
    <BaseForm
      onSubmit={onSubmit}
      defaultValues={defaultValues}
      schema={schema}
      initialValues={initialValues}
      className='w-full p-0'
    >
      {(form) => <>{renderField(searchFields, form)}</>}
    </BaseForm>
  );
}
