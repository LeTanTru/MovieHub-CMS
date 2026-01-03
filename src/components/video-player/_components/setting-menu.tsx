import { getLanguageLabel } from '@/utils';
import {
  Menu,
  Tooltip,
  useCaptionOptions,
  usePlaybackRateOptions,
  useVideoQualityOptions,
  type MenuPlacement,
  type TooltipPlacement
} from '@vidstack/react';
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClosedCaptionsIcon,
  OdometerIcon,
  RadioButtonIcon,
  RadioButtonSelectedIcon,
  SettingsIcon
} from '@vidstack/react/icons';

export const buttonClass =
  'group ring-media-focus relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset hover:bg-white/20 data-[focus]:ring-4';

export const tooltipClass =
  'animate-out fade-out slide-out-to-bottom-2 data-[visible]:animate-in data-[visible]:fade-in data-[visible]:slide-in-from-bottom-4 z-10 rounded-sm bg-black/90 px-2 py-0.5 text-sm font-medium text-white parent-data-[open]:hidden';

export interface SettingsProps {
  placement: MenuPlacement;
  tooltipPlacement: TooltipPlacement;
}

export const menuClass =
  'animate-out fade-out slide-out-to-bottom-2 data-[open]:animate-in data-[open]:fade-in data-[open]:slide-in-from-bottom-4 flex h-[var(--menu-height)] max-h-[400px] min-w-[300px] flex-col overflow-y-auto overscroll-y-contain rounded-md border border-white/10 bg-black/95 p-2.5 font-sans text-[15px] font-medium outline-none backdrop-blur-sm transition-[height] duration-300 will-change-[height] data-[resizing]:overflow-hidden';

export const submenuClass =
  'hidden w-full flex-col items-start justify-center outline-none data-[keyboard]:mt-[3px] data-[open]:inline-block';

export default function SettingMenu({
  placement,
  tooltipPlacement
}: SettingsProps) {
  return (
    <Menu.Root className='parent'>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Menu.Button className={buttonClass}>
            <SettingsIcon className='h-8 w-8 transform transition-transform duration-200 ease-out group-data-[open]:rotate-90' />
          </Menu.Button>
        </Tooltip.Trigger>
        <Tooltip.Content className={tooltipClass} placement={tooltipPlacement}>
          Cài đặt
        </Tooltip.Content>
      </Tooltip.Root>
      <Menu.Content className={menuClass} placement={placement}>
        <CaptionSubmenu />
        <SpeedSubmenu />
        <VideoQualitySubmenu />
      </Menu.Content>
    </Menu.Root>
  );
}

function CaptionSubmenu() {
  const options = useCaptionOptions(),
    hint = options.selectedTrack?.label ?? 'Off';
  return (
    <Menu.Root>
      <Menu.Button
        className='ring-media-focus parent left-0 z-10 flex w-full cursor-pointer items-center justify-start rounded-sm bg-black/60 p-2.5 outline-none select-none ring-inset aria-disabled:hidden data-[focus]:ring-[3px] data-[hocus]:bg-white/10 data-[open]:sticky data-[open]:-top-2.5'
        disabled={options.disabled}
      >
        <ChevronLeftIcon className='parent-data-[open]:block mr-1.5 -ml-0.5 hidden h-[18px] w-[18px]' />
        <div className='parent-data-[open]:hidden contents'>
          <ClosedCaptionsIcon className='size-5' />
        </div>
        <span className='parent-data-[open]:ml-0 ml-1.5'>Phụ đề</span>
        <span className='ml-auto text-sm text-white/50'>
          {getLanguageLabel(hint)}
        </span>
        <ChevronRightIcon className='parent-data-[open]:hidden ml-0.5 h-[18px] w-[18px] text-sm text-white/50' />
      </Menu.Button>

      <Menu.Content className={submenuClass}>
        <Menu.RadioGroup
          className='flex w-full flex-col'
          value={options.selectedValue}
        >
          {options.map(({ label, value, select }) => {
            return (
              <Radio value={value} onSelect={select} key={value}>
                {getLanguageLabel(label)}
              </Radio>
            );
          })}
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu.Root>
  );
}

function Radio({ children, ...props }: Menu.RadioProps) {
  return (
    <Menu.Radio
      className='ring-media-focus group relative flex w-full cursor-pointer items-center justify-start rounded-sm p-2.5 outline-none select-none data-[focus]:ring-[3px] data-[hocus]:bg-white/10'
      {...props}
    >
      <RadioButtonIcon className='h-4 w-4 text-white group-data-[checked]:hidden' />
      <RadioButtonSelectedIcon className='text-media-brand hidden h-4 w-4 group-data-[checked]:block' />
      <span className='ml-2'>{children}</span>
    </Menu.Radio>
  );
}

function SpeedSubmenu() {
  const options = usePlaybackRateOptions();
  const hint = options.selectedValue + 'x';

  return (
    <Menu.Root>
      <Menu.Button
        className='ring-media-focus parent left-0 z-10 flex w-full cursor-pointer items-center justify-start rounded-sm bg-black/60 p-2.5 outline-none select-none ring-inset aria-disabled:hidden data-[focus]:ring-[3px] data-[hocus]:bg-white/10 data-[open]:sticky data-[open]:-top-2.5'
        disabled={options.disabled}
      >
        <ChevronLeftIcon className='parent-data-[open]:block mr-1.5 -ml-0.5 hidden h-[18px] w-[18px]' />
        <div className='parent-data-[open]:hidden contents'>
          <OdometerIcon size={20} />
        </div>
        <span className='parent-data-[open]:ml-0 ml-1.5'>Tốc độ</span>
        <span className='ml-auto text-sm text-white/50'>{hint}</span>
        <ChevronRightIcon className='parent-data-[open]:hidden ml-0.5 h-[18px] w-[18px] text-sm text-white/50' />
      </Menu.Button>

      <Menu.Content className={submenuClass}>
        <Menu.RadioGroup
          className='flex w-full flex-col'
          value={options.selectedValue}
        >
          {options.map(({ label, value, select }) => (
            <Menu.Radio
              key={value}
              value={value}
              onSelect={select}
              className='ring-media-focus group relative flex w-full cursor-pointer items-center justify-start rounded-sm p-2.5 outline-none select-none data-[focus]:ring-[3px] data-[hocus]:bg-white/10'
            >
              <RadioButtonIcon className='h-4 w-4 text-white group-data-[checked]:hidden' />
              <RadioButtonSelectedIcon className='text-media-brand hidden h-4 w-4 group-data-[checked]:block' />
              <span className='ml-2'>{label === 'Normal' ? '1x' : label}</span>
            </Menu.Radio>
          ))}
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu.Root>
  );
}

function VideoQualitySubmenu() {
  const options = useVideoQualityOptions({ auto: true, sort: 'descending' });

  const currentQualityHeight = options.selectedQuality?.height;
  const hint =
    options.selectedValue !== 'auto' && currentQualityHeight
      ? `${currentQualityHeight}p`
      : `${'Tự động'}${currentQualityHeight ? ` (${currentQualityHeight}p)` : ''}`;

  return (
    <Menu.Root>
      <Menu.Button
        className='ring-media-focus parent left-0 z-10 flex w-full cursor-pointer items-center justify-start rounded-sm bg-black/60 p-2.5 outline-none select-none ring-inset aria-disabled:hidden data-[focus]:ring-[3px] data-[hocus]:bg-white/10 data-[open]:sticky data-[open]:-top-2.5'
        disabled={options.disabled}
      >
        <ChevronLeftIcon className='parent-data-[open]:block mr-1.5 -ml-0.5 hidden h-[18px] w-[18px]' />
        <div className='parent-data-[open]:hidden contents'>
          <CheckIcon className='size-5' />
        </div>
        <span className='parent-data-[open]:ml-0 ml-1.5'>Chất lượng</span>
        <span className='ml-auto text-sm text-white/50'>{hint}</span>
        <ChevronRightIcon className='parent-data-[open]:hidden ml-0.5 h-[18px] w-[18px] text-sm text-white/50' />
      </Menu.Button>

      <Menu.Content className={submenuClass}>
        <Menu.RadioGroup
          className='flex w-full flex-col'
          value={options.selectedValue}
        >
          {options.map(({ quality, label, value, bitrateText, select }) => (
            <Menu.Radio
              className='ring-media-focus group relative flex w-full cursor-pointer items-center justify-start rounded-sm p-2.5 outline-none select-none data-[focus]:ring-[3px] data-[hocus]:bg-white/10'
              value={value}
              onSelect={select}
              key={value}
            >
              <RadioButtonIcon className='h-4 w-4 text-white group-data-[checked]:hidden' />
              <RadioButtonSelectedIcon className='text-media-brand hidden h-4 w-4 group-data-[checked]:block' />
              <span className='ml-2'>
                {label === 'Auto' ? 'Tự động' : label}
              </span>
              {bitrateText && (
                <span className='ml-auto text-sm text-white/40'>
                  {bitrateText}
                </span>
              )}
            </Menu.Radio>
          ))}
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu.Root>
  );
}
