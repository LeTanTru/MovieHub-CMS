'use client';

import './rich-text-field.css';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { cn } from '@/lib/utils';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';

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
import dynamic from 'next/dynamic';

const TinyEditor = dynamic(
  () => import('@tinymce/tinymce-react').then((m) => m.Editor),
  {
    ssr: false,
    loading: () => (
      <div className='bg-muted text-muted-foreground flex h-[450px] items-center justify-center rounded border text-sm'>
        Loading editor...
      </div>
    )
  }
);

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
  return (
    <FormField
      control={control}
      name={name}
      rules={{ required }}
      render={({ field, fieldState }) => (
        <FormItem className={cn('relative flex flex-col gap-1', className)}>
          {label && (
            <FormLabel className='mb-1 ml-2'>
              {label} {required && <span className='text-destructive'>*</span>}
            </FormLabel>
          )}

          <FormControl>
            <TinyEditor
              tinymceScriptSrc={envConfig.NEXT_PUBLIC_TINYMCE_URL}
              licenseKey='gpl'
              value={field.value || ''}
              disabled={disabled || readOnly}
              init={{
                height: height ?? 450,
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
                  'undo redo | bold italic underline strikethrough | fontfamily fontsizeinput blocks | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media template link anchor codesample code | ltr rtl',
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
