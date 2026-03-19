export type NotebookCoverType = 'forest' | 'emerald' | 'lime' | 'sage';
export type LegacyCoverType = 'default' | 'red' | 'blue' | 'green';

export const FolderOptions: { value: NotebookCoverType; viewValue: string }[] =
  [
    { value: 'forest', viewValue: 'Forest' },
    { value: 'emerald', viewValue: 'Emerald' },
    { value: 'lime', viewValue: 'Lime' },
    { value: 'sage', viewValue: 'Sage' },
  ];

/** Map API legacy cover to UI display cover */
export function mapLegacyCover(legacy: string): NotebookCoverType {
  switch (legacy) {
    case 'red':
      return 'forest';
    case 'blue':
      return 'emerald';
    case 'green':
      return 'lime';
    case 'default':
    default:
      return 'sage';
  }
}

/** Map UI cover to API legacy value when creating/editing notebooks */
export function toLegacyCover(cover: NotebookCoverType): LegacyCoverType {
  switch (cover) {
    case 'forest':
      return 'red';
    case 'emerald':
      return 'blue';
    case 'lime':
      return 'green';
    case 'sage':
    default:
      return 'default';
  }
}
