let ignoreScrollEvents = false;

let edit: HTMLElement | null;
let view: HTMLElement | null;

export const initScrollSync = () => {
  edit = document.querySelector('#edit');
  view = document.querySelector('#view');
  addScrollListeners();
};

export const removeScrollSync = () => {
  removeScrollListeners();
};

const calcScroll = (element1: HTMLElement, element2: HTMLElement) => {
  let scroll_end = element2.scrollHeight - element2.clientHeight;
  let percent =
    (element1.scrollTop / (element1.scrollHeight - element1.clientHeight)) *
    100;
  let percent_to_pos = scroll_end * (percent / 100);
  return percent_to_pos;
};

export const removeScrollListeners = () => {
  edit?.removeEventListener('scroll', editScroll);
  view?.removeEventListener('scroll', viewScroll);
};

const editScroll = () => {
  let element2 = view!;
  let element1 = edit!;

  let percent_to_pos = calcScroll(element1, element2);

  var ignore = ignoreScrollEvents;
  ignoreScrollEvents = false;
  if (ignore) return;
  ignoreScrollEvents = true;
  element2.scrollTop = percent_to_pos;
};

const viewScroll = () => {
  let element1 = view!;
  let element2 = edit!;

  let percent_to_pos = calcScroll(element1, element2);

  var ignore = ignoreScrollEvents;
  ignoreScrollEvents = false;
  if (ignore) return;
  ignoreScrollEvents = true;
  element2.scrollTop = percent_to_pos;
};

const addScrollListeners = () => {
  if (view !== null && edit !== null) {
    edit.addEventListener('scroll', editScroll);
  }

  if (view !== null && edit !== null) {
    view.addEventListener('scroll', viewScroll);
  }
};
