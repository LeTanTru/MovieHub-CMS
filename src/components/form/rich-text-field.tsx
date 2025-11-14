'use client';

import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Editor } from '@tinymce/tinymce-react';
import { useIsMounted } from '@/hooks';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';
import './rich-text-editor.css';

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
};

import type { Editor as TinyMCEEditor } from 'tinymce';
import envConfig from '@/config';

export default function RichTextField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  className,
  required = false,
  disabled = false,
  readOnly = false,
  height
}: RichTextFieldProps<T>) {
  const isMounted = useIsMounted();
  if (!isMounted) return null;

  return (
    <FormField
      control={control}
      name={name}
      rules={{ required }}
      render={({ field, fieldState }) => (
        <FormItem className={cn('relative flex flex-col gap-1', className)}>
          {label && (
            <FormLabel className='ml-2'>
              {label} {required && <span className='text-destructive'>*</span>}
            </FormLabel>
          )}

          <FormControl>
            <Editor
              tinymceScriptSrc={envConfig.NEXT_PUBLIC_TINYMCE_URL}
              licenseKey='gpl'
              value={field.value || ''}
              disabled={disabled || readOnly}
              init={{
                height: height ?? 500,
                menubar: 'file edit view insert format tools table help',
                language: 'vi',
                plugins: [
                  'preview',
                  'importcss',
                  'searchreplace',
                  'autolink',
                  'autosave',
                  'save',
                  'directionality',
                  'code',
                  'visualblocks',
                  'visualchars',
                  'fullscreen',
                  'image',
                  'link',
                  'media',
                  'codesample',
                  'table',
                  'charmap',
                  'pagebreak',
                  'nonbreaking',
                  'anchor',
                  'insertdatetime',
                  'advlist',
                  'lists',
                  'wordcount',
                  'charmap',
                  'emoticons'
                ],
                toolbar:
                  'undo redo | bold italic underline strikethrough | fontfamily fontsize blocks | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media template link anchor codesample | ltr rtl',
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
                promotion: false,
                tabfocus_elements: ':prev,:next',
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
                }
              }}
              onEditorChange={(content) => field.onChange(content)}
            />
          </FormControl>

          {fieldState.error && (
            <div className='animate-in fade-in absolute -bottom-6 left-2 z-0 mt-1 text-sm text-red-500'>
              <FormMessage />
            </div>
          )}
        </FormItem>
      )}
    />
  );
}
