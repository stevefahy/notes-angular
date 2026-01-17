/**
 * // useWindowDimension.ts
 * * This returns the viewport/window height and width
 */

import { signal, WritableSignal } from '@angular/core';
import APPLICATION_CONSTANTS from '../application-constants/application-constants';
import { WindowDimensions } from 'src/app/core/model/global';

const useWindowDimensions = (): WritableSignal<WindowDimensions> => {
  const handleResize = (): void => {
    windowDimensions.update((prev) => {
      return {
        ...prev,
        width: window.innerWidth,
        height: window.innerHeight,
        viewnote_width:
          document.querySelector('#viewnote_id') &&
          document.querySelector('#viewnote_id')!.clientWidth <
            window.innerWidth
            ? document.querySelector('#viewnote_id')!.clientWidth
            : document.querySelector('#viewnote_id')
            ? window.innerWidth - APPLICATION_CONSTANTS.VIEWNOTE_PADDING_MOBILE
            : window.innerWidth - APPLICATION_CONSTANTS.VIEWNOTE_PADDING,
      };
    });
  };

  const addListener = () => {
    window.addEventListener('resize', handleResize);
  };

  const removeListener = () => {
    window.removeEventListener('resize', handleResize);
  };

  const windowDimensions = signal<WindowDimensions>({
    width: 0,
    height: 0,
    viewnote_width: 0,
    addListener: addListener,
    removeListener: removeListener,
  });

  handleResize();

  return windowDimensions;
};

export default useWindowDimensions;
