const APPLICATION_CONSTANTS = {
  // SIGNUP
  SIGNUP_INVALID_USERNAME: `Invalid Username.
    A minimum of 2 characters are required.`,
  SIGNUP_INVALID_PASSWORD: `Invalid password.
    A minimum of 7 characters are required.`,
  SIGNUP_INVALID_EMAIL: `Invalid Email.
    Please try again!`,
  SIGNUP_EMAIL_REGISTERED: `That email is already registered.`,
  SIGNUP_ERROR: `Failed to signup.`,
  REFRESH_TOKEN_ERROR: `Failed to retrieve a valid Refresh Token.`,
  GENERAL_ERROR: 'Something went wrong! Please try again later.',
  CREATE_NOTEBOOK_ERROR: `Failed to create Notebook.`,
  CREATE_NOTE_ERROR: `Failed to create Note.`,
  CREATE_USER_ERROR: `Failed to create User.`,
  CHANGE_USER_GENERAL: `Failed to change the user name.`,
  CHANGE_USER_ERROR: `An error occured updating the user name!`,
  CHANGE_USER_UNIQUE: `Please enter a new User Name`,
  CHANGE_USER_TOO_FEW: `Please enter a User Name which has at least 3 characters`,
  CHANGE_USER_TOO_MANY: `Please enter a User Name which has less than 10 characters`,
  CHANGE_PASS_UNIQUE: `Both passwords are the same. Please enter a new Password`,
  CHANGE_PASS_TOO_FEW: `Please enter a Password which has at least 3 characters`,
  CHANGE_PASS_TOO_MANY: `Please enter a Password which has less than 7 characters`,
  CHANGE_PASS_LENGTH: `The passwords are different`,
  CHANGE_PASS_ERROR: `An error occured updating the Password!`,
  LOGOUT_ERROR: `There was a problem logging out.`,
  LOGIN_ERROR: `There was a problem logging in.`,
  UNAUTHORIZED: `Unauthorized`,
  USERNAME_MIN: 3,
  USERNAME_MAX: 10,
  PASSWORD_MIN: 3,
  PASSWORD_MAX: 10,
  NOTEBOOK_NAME_MIN: 3,
  NOTEBOOK_NAME_MAX: 10,
  NOTEBOOK_NAME_MIN_ERROR: `The Notebook name must be at least 3 characters!`,
  NOTEBOOK_NAME_MAX_ERROR: `The Notebook name must be less than 10 characters!`,
  NOTEBOOK_COVER_EMPTY: `Please select a cover!`,
  NOTEBOOKS_ERROR: `Could not fetch the notebooks.`,
  NOTEBOOK_ERROR: `Could not fetch the notebook.`,
  NOTEBOOK_CREATE_ERROR: `Could not create the notebook.`,
  NOTEBOOK_DELETE_ERROR: `Could not delete the notebook.`,
  NOTE_ERROR: `Could not fetch the note.`,
  NOTES_ERROR: `Could not fetch the notes.`,
  NOTE_CREATE_ERROR: `Could not create the note.`,
  NOTES_DELETE_ERROR: `Could not delete the notes.`,
  NOTE_SAVE_ERROR: `Could not delete the note.`,
  NOTEBOOK_UPDATE_DATE_ERROR: `Could not update the Notebook date.`,

  MOBILE_LAYOUT_WIDTH: 380,
  SPLITSCREEN_MINIMUM_WIDTH: 500,
  VIEWNOTE_PADDING: 69,
  VIEWNOTE_PADDING_MOBILE: 52,
  DEFAULT_PAGE: '/notebooks',
  LOGIN_PAGE: `/login`,
  REFRESH_TOKEN_INTERVAL: 5 * 60 * 1000,
};

export default APPLICATION_CONSTANTS;
