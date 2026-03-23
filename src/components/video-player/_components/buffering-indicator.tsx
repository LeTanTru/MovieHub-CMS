import { Spinner } from '@vidstack/react';

export default function BufferingIndicator() {
  return (
    <div className='vds-buffering-indicator'>
      <Spinner.Root className='vds-buffering-spinner max-768:size-15! max-990:size-20! max-480:size-10!'>
        <Spinner.Track className='vds-buffering-track' />
        <Spinner.TrackFill className='vds-buffering-track-fill' />
      </Spinner.Root>
    </div>
  );
}
