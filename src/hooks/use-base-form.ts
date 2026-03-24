import { zodResolver } from '@hookform/resolvers/zod';
import {
  DefaultValues,
  FieldValues,
  useForm,
  useFormState
} from 'react-hook-form';

const useBaseForm = <T extends FieldValues>({
  schema,
  defaultValues,
  mode = 'onChange'
}: {
  schema: any;
  defaultValues: DefaultValues<T>;
  mode?: 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all';
}) => {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode
  });

  const formState = useFormState({ control: form.control });

  return { ...form, formState };
};

export default useBaseForm;
