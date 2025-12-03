export enum HttpMessage {
  // Auth-related
  EMAIL_REQUIRED = 'Email is required',
  PASSWORD_REQUIRED = 'Email, token and new password are required',
  USER_NOT_FOUND = 'User does not exist',
  PASSWORD_INCORRECT = 'Incorrect Password',
  INVALID_OR_EXPIRED_TOKEN = 'Invalid or expired reset token',
  RESET_SUCCESS = 'Password has been reset',
  RESET_SENT = 'Reset instructions sent',
  LOGIN_REQUIRED = 'Email and password are required',
  LOGIN_SUCCESS = 'Login successful', // ✅ Add this line

  // Assignment-related
  MISSING_ASSIGNMENT_FIELDS = 'Missing required assignment fields',
  ASSIGNMENT_NOT_FOUND = 'Assignment not found',
  ASSIGNMENT_ALREADY_SUBMITTED = 'Assignment already submitted',
  LATE_SUBMISSION_NOT_ALLOWED = 'Late submissions are not allowed for this assignment',
  MISSING_STUDENT_INFO = 'Student ID and name are required',
  SUBMISSION_CONTENT_REQUIRED = 'Submission content is required',
  GRADE_EXCEEDS_MAX = 'Grade cannot exceed maximum marks',
  SUBMISSION_NOT_FOUND_FOR_STUDENT = 'No submission found for student ID:',
  INVALID_DUE_DATE = 'Due date cannot be in the past',

  // Common/Generic
  UNAUTHORIZED = 'You are not authorized to perform this action',
  FORBIDDEN = 'Access denied',
  BAD_REQUEST = 'Bad request',
  INTERNAL_ERROR = 'Something went wrong',


  // Admin-related
ADMIN_CREATED = 'Admin created successfully',
ADMIN_CREATION_FAILED = 'Failed to create admin',
PROFILE_IMAGE_UPDATED = 'Profile image updated successfully',
PROFILE_IMAGE_UPDATE_FAILED = 'Failed to update profile image',
ADMIN_NOT_FOUND = 'Admin not found',
ADMIN_RETRIEVED = 'Admin retrieved successfully',
ADMIN_UPDATE_FAILED = 'Failed to update admin',
ADMIN_DELETED = 'Admin deleted successfully',
ADMIN_DELETE_FAILED = 'Failed to delete admin',
ADMINS_RETRIEVED = 'Admins retrieved successfully',
ADMINS_RETRIEVE_FAILED = 'Failed to retrieve admins',
USERS_RETRIEVED = 'Users retrieved successfully',
NO_USERS_FOUND = 'No users found',
USER_SEARCH_FAILED = 'Failed to search users',
INVALID_SEARCH_TERM = 'Invalid search term',
INVALID_ROLE_PARAM = 'Invalid role parameter',
NO_IMAGE_UPLOADED = 'No image uploaded',

}


// src/common/enums/chat-message.enum.ts

export enum ChatMessage {
  // Chat initiation
  CHAT_INITIATED_SUCCESSFULLY = 'Chat initiated successfully',
  CHAT_INITIATION_FAILED = 'Failed to initiate chat',
  INVALID_USER_ID = 'Invalid teacherId or studentId format',

  // Message saving
  MISSING_REQUIRED_FIELDS = 'Missing required fields',
  MESSAGE_OR_MEDIA_REQUIRED = 'Message or media is required',
  MESSAGE_SAVE_FAILED = 'Failed to save message',
  MESSAGE_SAVED_SUCCESSFULLY = 'Message saved successfully',

  // Message deletion
  MESSAGE_DELETED_SUCCESSFULLY = 'Message deleted successfully',
  MESSAGE_DELETE_FAILED = 'Failed to delete message',

  // Reactions
  REACTION_ADDED = 'Reaction added successfully',
  REACTION_FAILED = 'Failed to add reaction',

  // Fetch messages
  CHAT_ID_REQUIRED = 'Chat ID is required',
  MESSAGE_FETCH_FAILED = 'Failed to get messages',

  // Chat list
  USER_ID_REQUIRED = 'User ID is missing',
  CHAT_LIST_FETCH_FAILED = 'Failed to get chat list',

  // Typing & seen
  USER_TYPING = 'User is typing',
  MESSAGES_SEEN = 'Messages seen',

  // User connection
  USER_CONNECTED = 'User connected to chat',
  USER_DISCONNECTED = 'User disconnected from chat'
}

export enum CourseMessage {
  COURSE_NAME_REQUIRED = 'Course name is required and cannot be empty',
  COURSE_CODE_REQUIRED = 'Course code is required and cannot be empty',
  COURSE_NAME_EXISTS = 'Course with this name already exists',
  COURSE_CODE_EXISTS = 'Course with this code already exists',
  COURSE_ID_REQUIRED = 'Course ID is required',
  DEPARTMENT_ID_REQUIRED = 'Department ID is required',
  COURSE_NOT_FOUND = 'Course not found',
}

export enum NotificationMessage {
  CREATE_FAILED = 'Failed to create notification',
  FETCH_FAILED = 'Failed to fetch notifications',
  MARK_READ_FAILED = 'Failed to mark notification as read',
  MARK_ALL_READ_FAILED = 'Failed to mark all notifications as read',
  DELETE_FAILED = 'Failed to delete notification'
}


