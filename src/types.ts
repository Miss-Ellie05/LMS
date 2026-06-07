/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  shelf: string;
  isbn: string;
  status: "Available" | "Borrowed" | "Overdue";
  borrowerId?: string;
  borrowerName?: string;
  dueDate?: string; // ISO string
}

export interface SpaceBooking {
  id: string;
  spaceType: "Study Carrel" | "Computer Lab";
  spaceName: string;
  timeSlot: string;
  bookedBy: string;
  email: string;
  bookingDate: string; // YYYY-MM-DD
}

export interface Member {
  id: string;
  name: string;
  email: string;
  barcode: string;
  accountType: "Student" | "Researcher" | "Community Member";
  joinedAt: string; // YYYY-MM-DD
  fines: number;
}

export interface Loan {
  id: string;
  bookId: string;
  bookTitle: string;
  author: string;
  isbn: string;
  memberEmail: string;
  memberName: string;
  borrowDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  status: "Active" | "Returned" | "Overdue";
  returnedDate?: string;
}

export interface EResource {
  id: string;
  title: string;
  category: "Textbook" | "Research Paper" | "Open-Source PDF";
  fileSize: string;
  url: string;
  author: string;
  year: number;
  downloads: number;
  description: string;
}

export interface SMSAlert {
  id: string;
  recipientPhone: string;
  recipientPhoneFormatted: string;
  message: string;
  sentAt: string;
  type: "Deadline Warning" | "Overdue Fine Reminder" | "Ad-hoc Update" | "Welcome";
  status: "Delivered" | "Pending";
}
