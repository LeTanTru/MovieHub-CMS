'use client';

import './rich-text-field.css';
import {
  type Control,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
  type Path
} from 'react-hook-form';
import { cn } from '@/lib/utils';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';

import type { Editor as TinyMCEEditor } from 'tinymce';
import { envConfig } from '@/config';
import dynamic from 'next/dynamic';
import { useRef } from 'react';

const TINYMCE_DEFAULT_HEIGHT = 450;

const TinyEditor = dynamic(
  () => import('@tinymce/tinymce-react').then((m) => m.Editor),
  {
    ssr: false,
    loading: () => (
      <div className='bg-muted text-muted-foreground flex h-112.5 items-center justify-center rounded border text-sm'>
        Loading editor…
      </div>
    )
  }
);

type RichTextFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  height?: number;
  labelClassName?: string;
  formItemClassName?: string;
};

export function RichTextField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  className,
  required = false,
  disabled = false,
  readOnly = false,
  height,
  labelClassName,
  formItemClassName
}: RichTextFieldProps<T>) {
  const hasInitialized = useRef<boolean>(false);
  const initialValueRef = useRef<string>('');

  const handleEditorChange = (
    content: string,
    editor: TinyMCEEditor,
    field: ControllerRenderProps<T, Path<T>>
  ) => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      if (content === (field.value ?? '')) {
        initialValueRef.current = content;
        return;
      }
    }
    editor.setDirty(true);
    field.onChange(content);
  };

  const handleUndoRedo = (
    editor: TinyMCEEditor,
    field: ControllerRenderProps<T, Path<T>>
  ) => {
    const currentContent = editor.getContent();
    if (currentContent === initialValueRef.current) {
      const rhfDefault = (name as string)
        .split('.')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .reduce((obj: any, key) => obj?.[key], control._defaultValues) as
        | string
        | undefined;
      field.onChange(rhfDefault ?? initialValueRef.current);
      return;
    }
    field.onChange(currentContent);
  };

  return (
    <FormField
      control={control}
      name={name}
      rules={{ required }}
      render={({ field, fieldState }) => (
        <FormItem
          className={cn(
            'relative flex flex-col',
            {
              'cursor-not-allowed select-none': disabled
            },
            formItemClassName
          )}
        >
          {label && (
            <FormLabel
              className={cn(
                'ml-2',
                {
                  'pointer-events-none opacity-50 select-none':
                    disabled || readOnly
                },
                labelClassName
              )}
            >
              {label} {required && <span className='text-destructive'>*</span>}
            </FormLabel>
          )}

          <FormControl>
            <div
              className={cn(
                {
                  'pointer-events-none cursor-not-allowed opacity-50 select-none':
                    disabled || readOnly
                },
                className
              )}
            >
              <TinyEditor
                tinymceScriptSrc={envConfig.NEXT_PUBLIC_TINYMCE_URL}
                licenseKey='gpl'
                value={field.value}
                disabled={disabled || readOnly}
                init={{
                  height: height ?? TINYMCE_DEFAULT_HEIGHT,
                  menubar: 'file edit view insert format tools table help',
                  language: 'vi',
                  plugins: [
                    'preview',
                    'importcss',
                    'searchreplace',
                    'autolink',
                    // 'autosave',
                    'save',
                    'directionality',
                    'visualblocks',
                    'visualchars',
                    'fullscreen',
                    'image',
                    'link',
                    'media',
                    'table',
                    'charmap',
                    'pagebreak',
                    'nonbreaking',
                    'anchor',
                    'insertdatetime',
                    'advlist',
                    'lists',
                    'wordcount',
                    'emoticons'
                  ],
                  toolbar:
                    'undo redo | bold italic underline strikethrough | fontfamily fontsizeinput blocks | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media template link anchor | ltr rtl',
                  valid_elements:
                    'p,h1,h2,h3,h4,h5,h6,a[href|target|rel],strong,b,em,i,strike,u,ul,ol,li,br,img[src|alt|width|height],table,thead,tbody,tr,th,td,span[style],div[style],figure,figcaption,iframe[src|width|height|allow|allowfullscreen|title],blockquote',
                  extended_valid_elements:
                    'iframe[src|width|height|allow|allowfullscreen|title]',
                  placeholder: placeholder,
                  content_style: `
                  body { 
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                    font-size: 14px; 
                    line-height: 1.5; 
                  }
                  * {
                    margin: 0 0 0 0; 
                  }
                  `,
                  paste_data_images: true,
                  paste_as_text: false,
                  paste_auto_cleanup_on_paste: true,
                  branding: false,
                  font_size_input_default_unit: 'px',
                  font_size_formats: '8px 12px 14px 15px 16px 18px 20px 32px',
                  promotion: false,
                  setup: (editor: TinyMCEEditor) => {
                    editor.on('keydown', (e: KeyboardEvent) => {
                      if (e.key === 'Tab' && !e.shiftKey) {
                        e.preventDefault();
                        editor.execCommand('mceInsertContent', false, '\u2003');
                      } else if (e.key === 'Tab' && e.shiftKey) {
                        e.preventDefault();

                        editor.undoManager.transact(() => {
                          const rng = editor.selection.getRng();
                          const startContainer = rng.startContainer as Text;

                          if (startContainer.nodeType === Node.TEXT_NODE) {
                            const text = startContainer.textContent || '';
                            const caretOffset = rng.startOffset;

                            if (text.startsWith('\u2003')) {
                              const newText = text.replace(/^\u2003/, '');
                              startContainer.textContent = newText;

                              const sel = editor.selection;
                              const newRange = document.createRange();
                              const newOffset = Math.max(caretOffset - 1, 0);
                              newRange.setStart(startContainer, newOffset);
                              newRange.collapse(true);
                              sel.setRng(newRange);
                            } else {
                              editor.execCommand('Outdent');
                            }
                          }
                        });
                      }
                    });
                    editor.on('paste cut', function () {
                      editor.setDirty(true);
                    });
                  }
                }}
                onEditorChange={(content, editor) => {
                  handleEditorChange(content, editor, field);
                }}
                onUndo={(_evt, editor) => {
                  handleUndoRedo(editor, field);
                }}
                onRedo={(_evt, editor) => {
                  handleUndoRedo(editor, field);
                }}
              />
              {fieldState.error && (
                <div className='animate-in fade-in -mb-6 ml-2 flex min-h-6 items-end'>
                  <FormMessage className='leading-5.5' />
                </div>
              )}
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
