import { NotebookCoverType } from 'src/app/core/model/global';

export interface Editing {
  status: boolean;
}

export interface Edited {
  _id: string;
  notebook_name: string;
  notebook_cover: NotebookCoverType;
}
