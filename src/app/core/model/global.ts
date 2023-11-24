export interface Global {}

import { TDateISO } from './date';
import {
  DeleteResult,
  InsertOneResult,
  UpdateResult,
  ObjectId,
  BulkWriteResult,
} from 'mongodb';

// Note Editor

export interface NoteEditor {
  visible: boolean;
  splitScreen: boolean;
  loadedText: string;
  updateViewText: (updatedView: string) => void;
  passUpdatedViewText: string;
}

export interface NoteEditorView {
  visible: boolean;
  splitScreen: boolean;
  viewText: string;
  updatedViewText: (updatedEdit: string) => void;
}

export interface ViewNoteMarkdownProps {
  viewText: string;
  scrollView?: number;
  splitScreen?: boolean;
  updatedViewText: (updatedEdit: string) => void;
  disableLinks: boolean;
}

export interface SourcePosition {
  start: { column?: number; line?: number; offset?: number };
  end: { column?: number; line?: number; offset?: number };
}

// Note

export interface Note {
  _id: string;
  note: string;
  notebook: string;
  createdAt: TDateISO | 'No date';
  updatedAt: TDateISO | 'No date';
}

// Notebook

export interface NotebookItem {
  notebook_item: Notebook;
}

export interface Notebook {
  _id: string;
  notebook_name: string;
  notebook_cover: NotebookCoverType;
  createdAt?: TDateISO | 'No date';
  updatedAt?: TDateISO | 'No date';
}

interface CreateNoteError {
  error: string;
  success?: never;
  note?: never;
}

interface CreateNoteSuccess {
  error?: never;
  success: boolean;
  note: InsertOneResult<Document>;
}

export type CreateNote = CreateNoteError | CreateNoteSuccess;

interface DeleteNotebookError {
  error: string;
  success?: never;
  notebook_deleted?: never;
  server_response?: never;
}

interface DeleteNotebookSuccess {
  error?: never;
  success: boolean;
  notebook_deleted: ObjectId;
  server_response: UpdateResult<Document>;
}

export type DeleteNotebook = DeleteNotebookError | DeleteNotebookSuccess;

interface EditNotebookDateError {
  error: string;
  success?: never;
  notebook_date_updated?: never;
}

interface EditNotebookDateSuccess {
  error?: never;
  success: boolean;
  notebook_deleted: ObjectId;
  server_response: UpdateResult<Document>;
}

export type EditNotebookDate = EditNotebookDateError | EditNotebookDateSuccess;

interface EditNotebookError {
  error: string;
  success?: never;
  notebook_edited?: never;
}

interface EditNotebookSuccess {
  error?: never;
  success: boolean;
  notebook_edited: Notebook;
}

export type EditNotebook = EditNotebookError | EditNotebookSuccess;

interface GetNotebookError {
  error: string;
  success?: never;
  notebook?: never;
}

interface GetNotebookSuccess {
  error?: never;
  success: boolean;
  notebook: Notebook;
}

export type GetNotebook = GetNotebookError | GetNotebookSuccess;

interface GetNotebooksError {
  error: string;
  success?: never;
  notebooks?: never;
}

interface GetNotebooksSuccess {
  error?: never;
  success: boolean;
  notebooks: Notebook[];
}

export type GetNotebooks = GetNotebooksError | GetNotebooksSuccess;

export interface NotebooksListProps {
  notebooks: GetNotebooks;
}

export interface CheckedNote {
  id: string;
  selected: boolean;
}

export interface SelectedNote {
  selected: string[];
}

export interface NotesProps {
  notes: Note[];
  onNotesSelected: (selected: SelectedNote) => void;
  onNotesEdit: boolean;
  onClearNotesEdit: boolean;
}

export type NotebookAddEditMethod = 'edit' | 'create';

export interface NotebookAddEdit {
  method: NotebookAddEditMethod;
  notebook?: Notebook;
  onCancel: () => void;
  addNotebook?: (
    notebook_name: string,
    notebook_cover: NotebookCoverType
  ) => void;
  editNotebook?: (
    notebook_id: string,
    notebook_name: string,
    notebook_cover: NotebookCoverType,
    notebook_updated: string
  ) => void;
}

// SelectNotebookForm

export interface SelectNotebookFormProps {
  notebooks: Notebook[];
  onCancel: () => void;
  moveNotes: (notebook_id: string) => void;
}

// Notification

export type NotificationStatus = 'pending' | 'success' | 'error' | null;

export interface NotificationInterface {
  n_status?: NotificationStatus;
  title?: string | null;
  message?: string | null;
}

// Alert

export type ErrorSeverity = '' | 'error' | 'warning' | 'info' | 'success';

export interface AlertInterface {
  error_state?: boolean;
  error_severity?: ErrorSeverity;
  message?: string;
}

// Profile Form

export interface NewUsernameObj {
  newUsername: string;
}

export interface ChangePasswordObj {
  oldPassword: string | undefined;
  newPassword: string | undefined;
}

export interface ProfileFormProps {
  onChangePassword: (arg0: ChangePasswordObj) => void;
  onChangeUsername: (arg0: NewUsernameObj) => void;
  userName: string | undefined;
}

// Breadcrumb

export type PageType = 'notebooks' | 'notebook' | 'note' | 'profile' | 'other';

export type NotebookCoverType = 'default' | 'red' | 'green' | 'blue';

export type NotebookType = {
  name: string;
  id: string;
  cover: NotebookCoverType;
};

// Snackbar

export interface SnackbarProps {
  status: boolean;
  message: string;
}

export interface CreateNoteObj {
  notebookId: string;
  note: string;
}

// API RESPONSES

interface DeleteNotesError {
  success?: never;
  notes_deleted?: never;
  error: string;
}

interface DeleteNotesSuccess {
  success: boolean;
  notes_deleted: DeleteResult;
  error?: never;
}

export type DeleteNotes = DeleteNotesError | DeleteNotesSuccess;

interface GetNoteError {
  success?: never;
  note?: never;
  error: string;
}

interface GetNoteSuccess {
  success: boolean;
  note: Note;
  error?: never;
}

export type GetNote = GetNoteError | GetNoteSuccess;

interface GetNotesError {
  success?: never;
  notes?: never;
  error: string;
}

interface GetNotesSuccess {
  success: boolean;
  notes: Note[];
  error?: never;
}

export type GetNotes = GetNotesError | GetNotesSuccess;

interface MoveNotesError {
  success?: never;
  notes_moved?: never;
  server_response?: never;
  error: string;
}

interface MoveNotesSuccess {
  success: boolean;
  notes_moved: string[];
  server_response: BulkWriteResult;
  error?: never;
}

export type MoveNotes = MoveNotesError | MoveNotesSuccess;

interface SaveNoteError {
  success?: never;
  server_response?: never;
  error: string;
}

interface SaveNoteSuccess {
  success: boolean;
  server_response: UpdateResult<Document>;
  error?: never;
}

export type SaveNote = SaveNoteError | SaveNoteSuccess;

interface ChangePasswordError {
  success?: never;
  error: string;
}

interface ChangePasswordSuccess {
  success: boolean;
  error?: never;
}

export type ChangePassword = ChangePasswordError | ChangePasswordSuccess;

interface ChangeUsernameError {
  success?: never;
  details?: never;
  error: string;
}

interface ChangeUsernameSuccess {
  success: boolean;
  details: IAuthDetails;
  error?: never;
}

export type ChangeUsername = ChangeUsernameError | ChangeUsernameSuccess;

interface LogoutError {
  success?: never;
  error: string;
}

interface LogoutSuccess {
  success: boolean;
  error?: never;
}

export type Logout = LogoutError | LogoutSuccess;

// AuthContext

export type onLoginT = (
  email: string,
  password: string
) => Promise<AuthAuthenticate> | void;
export type onRegisterT = (
  username: string,
  email: string,
  password: string,
  framework: string
) => Promise<AuthSignup> | void;

export interface AuthContextType {
  authContext: IAuthContext;
}

export interface IAuthDetails {
  authStrategy: string;
  username: string;
  email: string;
  __v: number;
  _id: string;
}

export interface IAuthContext {
  loading: boolean | null;
  success: boolean | null;
  token: string | null;
  details: IAuthDetails | null;
  onLogin: (email: string, password: string) => Promise<AuthAuthenticate>;
  onRegister: (
    username: string,
    email: string,
    password: string,
    framework: string
  ) => Promise<AuthSignup>;
  onLogout: () => void;
}

interface AuthAuthenticateError {
  success?: never;
  token?: never;
  details?: never;
  error: string;
}

interface AuthAuthenticateSuccess {
  success: boolean;
  token: string;
  details: IAuthDetails;
  error?: never;
}

// AuthAuthenticate used by refreshtoken and login
export type AuthAuthenticate =
  | AuthAuthenticateError
  | AuthAuthenticateSuccess
  | undefined;

interface WelcomeNoteSuccess {
  notebookID: string;
  noteID: string;
}

interface WelcomeNoteError {
  notebookID?: never;
  noteID?: never;
}

export type AuthSignup =
  | (AuthAuthenticateError & WelcomeNoteError)
  | (AuthAuthenticateSuccess & WelcomeNoteSuccess)
  | undefined;

export interface FolderOptionsInterface {
  value: string;
  viewValue: string;
}

export type WindowDimensions = {
  width: number;
  height: number;
  viewnote_width: number | null | undefined;
  addListener: () => void;
  removeListener: () => void;
};
