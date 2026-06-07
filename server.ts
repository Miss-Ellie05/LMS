/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  shelf: string;
  isbn: string;
  status: "Available" | "Borrowed" | "Overdue";
  borrowerId?: string;
  borrowerName?: string;
  dueDate?: string;
}

interface SpaceBooking {
  id: string;
  spaceType: "Study Carrel" | "Computer Lab";
  spaceName: string;
  timeSlot: string;
  bookedBy: string;
  email: string;
  bookingDate: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  barcode: string;
  accountType: "Student" | "Researcher" | "Community Member";
  joinedAt: string;
  fines: number;
}

interface EResource {
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

interface SMSAlert {
  id: string;
  recipientPhone: string;
  recipientPhoneFormatted: string;
  message: string;
  sentAt: string;
  type: "Deadline Warning" | "Overdue Fine Reminder" | "Ad-hoc Update" | "Welcome";
  status: "Delivered" | "Pending";
}

// In-Memory Seed State
let books: Book[] = [
  {
    id: "bk-1",
    title: "Things Fall Apart",
    author: "Chinua Achebe",
    genre: "Fiction",
    shelf: "A-04",
    isbn: "9780385474542",
    status: "Available"
  },
  {
    id: "bk-2",
    title: "Anowa",
    author: "Ama Ata Aidoo",
    genre: "Drama",
    shelf: "B-12",
    isbn: "9780130380327",
    status: "Overdue",
    borrowerId: "mem-3",
    borrowerName: "Ekow Essien",
    dueDate: "2026-05-20"
  },
  {
    id: "bk-3",
    title: "Ghana: Path to Independence",
    author: "Albert Adu Boahen",
    genre: "History",
    shelf: "H-02",
    isbn: "9789964700034",
    status: "Available"
  },
  {
    id: "bk-4",
    title: "Advanced Engineering Mathematics",
    author: "K.A. Stroud",
    genre: "Science & Technology",
    shelf: "T-01",
    isbn: "9781137031204",
    status: "Borrowed",
    borrowerId: "mem-1",
    borrowerName: "Abena Mensah",
    dueDate: "2026-06-21"
  },
  {
    id: "bk-5",
    title: "Introduction to Cocoa Science",
    author: "Kwabena Gyasi",
    genre: "Agriculture",
    shelf: "G-08",
    isbn: "9789988109823",
    status: "Available"
  },
  {
    id: "bk-6",
    title: "A Grain of Wheat",
    author: "Ngũgĩ wa Thiong'o",
    genre: "Fiction",
    shelf: "A-06",
    isbn: "9780435905101",
    status: "Available"
  }
];

let members: Member[] = [
  {
    id: "mem-1",
    name: "Abena Mensah",
    email: "abena.mensah@university.edu.gh",
    barcode: "TKD-9811",
    accountType: "Student",
    joinedAt: "2025-09-12",
    fines: 15.00
  },
  {
    id: "mem-2",
    name: "Kofi Boateng",
    email: "kofi.boateng@research.org",
    barcode: "TKD-2104",
    accountType: "Researcher",
    joinedAt: "2025-05-04",
    fines: 0.00
  },
  {
    id: "mem-3",
    name: "Ekow Essien",
    email: "ekow.essien@gmail.com",
    barcode: "TKD-5502",
    accountType: "Community Member",
    joinedAt: "2026-01-20",
    fines: 45.50
  }
];

let bookings: SpaceBooking[] = [
  {
    id: "bkg-1",
    spaceType: "Study Carrel",
    spaceName: "Carrel 4A (Quiet Zone)",
    timeSlot: "09:00 AM - 11:00 AM",
    bookedBy: "Abena Mensah",
    email: "abena.mensah@university.edu.gh",
    bookingDate: "2026-06-08"
  },
  {
    id: "bkg-2",
    spaceType: "Computer Lab",
    spaceName: "PC Terminal #3",
    timeSlot: "11:00 AM - 01:00 PM",
    bookedBy: "Kofi Boateng",
    email: "kofi.boateng@research.org",
    bookingDate: "2026-06-08"
  }
];

let eresources: EResource[] = [
  {
    id: "eres-1",
    title: "The History of Fante States",
    category: "Research Paper",
    fileSize: "3.2 MB",
    url: "#download-fante",
    author: "Prof. E. K. Kofi",
    year: 2021,
    downloads: 142,
    description: "An in-depth geopolitical study modeling nineteenth-century expansion and alliances of Fante states along the western coast of Gold Coast."
  },
  {
    id: "eres-2",
    title: "West African Secondary College Physics",
    category: "Textbook",
    fileSize: "18.7 MB",
    url: "#download-physics",
    author: "Dr. Kwadwo Mensah",
    year: 2024,
    downloads: 389,
    description: "Standard WAEC prep resource covering mechanics, heat, electromagnetism and modern physics parameters for high schools."
  },
  {
    id: "eres-3",
    title: "Ghana Agricultural Journal 2025",
    category: "Research Paper",
    fileSize: "4.5 MB",
    url: "#download-agri",
    author: "CSIR Ghana",
    year: 2025,
    downloads: 74,
    description: "Annual reports outlining soil quality indices, cocoa yield optimization strategies, and irrigation frameworks in West Africa."
  }
];

let smsAlerts: SMSAlert[] = [
  {
    id: "sms-1",
    recipientPhone: "+233 24 555 1234",
    recipientPhoneFormatted: "+233 24 555 1234",
    message: "Welcome to Takoradi Hub LMS! Your digital barcode is TKD-9811. Please keep it handy for study space and catalog validation.",
    sentAt: "2026-06-01 02:44 PM",
    type: "Welcome",
    status: "Delivered"
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. GET ALL BOOKS
  app.get("/api/books", (req, res) => {
    res.json(books);
  });

  // 2. GET ALL BOOKINGS
  app.get("/api/bookings", (req, res) => {
    res.json(bookings);
  });

  // 3. GET ALL MEMBERS
  app.get("/api/members", (req, res) => {
    res.json(members);
  });

  // 4. GET ALL E-RESOURCES
  app.get("/api/eresources", (req, res) => {
    res.json(eresources);
  });

  // 5. GET ALL SMS ALERTS
  app.get("/api/sms-alerts", (req, res) => {
    res.json(smsAlerts);
  });

  // 6. ADD A NEW BOOK
  app.post("/api/books", (req, res) => {
    const { title, author, genre, shelf, isbn } = req.body;
    if (!title || !author || !isbn) {
      return res.status(400).json({ error: "Title, Author and ISBN fields are highly mandatory." });
    }
    const newBook: Book = {
      id: "bk-" + (books.length + 1) + "_" + Math.floor(Math.random() * 1000),
      title,
      author,
      genre: genre || "General literature",
      shelf: shelf || "G-01",
      isbn,
      status: "Available"
    };
    books.push(newBook);
    res.status(201).json(newBook);
  });

  // 7. MULTI-LEVEL BARCODE VALIDATING LOAN CHECKOUT
  app.post("/api/loans/checkout", (req, res) => {
    const { bookId, memberBarcode } = req.body;
    if (!bookId || !memberBarcode) {
      return res.status(400).json({ error: "Book reference and valid Patron barcode barcode are required." });
    }

    const book = books.find(b => b.id === bookId);
    if (!book) {
      return res.status(404).json({ error: "The requested literary resource is not catalogued." });
    }

    if (book.status !== "Available") {
      return res.status(400).json({ error: "Selected edition is already borrowed or checked out by another registrant." });
    }

    const member = members.find(m => m.barcode.toLowerCase() === memberBarcode.toLowerCase());
    if (!member) {
      return res.status(404).json({ error: "Unidentified subscriber barcode. Please register your digital profile first." });
    }

    // Business Rule: Student fine ceiling block ($50.00 limit)
    if (member.fines >= 50) {
      return res.status(403).json({ error: `Checkout blocked! Patron has $${member.fines.toFixed(2)} unpaid overdue fines.` });
    }

    // Borrow restriction limits based on role:
    const activeLoansForMemberCount = books.filter(b => b.borrowerId === member.id).length;
    if (member.accountType === "Student" && activeLoansForMemberCount >= 3) {
      return res.status(403).json({ error: "Academic Fair-loading Rule: Students are restricted to maximum 3 concurrent volumes." });
    } else if (member.accountType === "Community Member" && activeLoansForMemberCount >= 2) {
      return res.status(403).json({ error: "Community visitors are capped at 2 concurrent materials borrowing." });
    }

    // Set dates
    const checkoutDurationDays = member.accountType === "Researcher" ? 30 : 14;
    const today = new Date();
    const dueDateObj = new Date();
    dueDateObj.setDate(today.getDate() + checkoutDurationDays);

    book.status = "Borrowed";
    book.borrowerId = member.id;
    book.borrowerName = member.name;
    book.dueDate = dueDateObj.toISOString().split('T')[0];

    // Auto-create confirmation message in system dispatch pipeline
    const alertId = "sms-" + Date.now();
    const todayFormattedStr = today.toISOString().replace(/T/, ' ').replace(/\..+/, '').slice(0, 16);
    const newAlert: SMSAlert = {
      id: alertId,
      recipientPhone: "+233 24 000 " + member.barcode.replace("TKD-", ""),
      recipientPhoneFormatted: "+233 24 *** " + member.barcode.replace("TKD-", ""),
      message: `Takoradi Hub Checkout Confirmed: "${book.title}" due on ${book.dueDate}. Protect the book integrity!`,
      sentAt: todayFormattedStr,
      type: "Deadline Warning",
      status: "Delivered"
    };
    smsAlerts.unshift(newAlert);

    res.json({ success: true, book });
  });

  // 8. CHECKIN / RETURN LOAN
  app.post("/api/loans/checkin", (req, res) => {
    const { bookId } = req.body;
    if (!bookId) {
      return res.status(400).json({ error: "Please point a valid book index identifier." });
    }

    const book = books.find(b => b.id === bookId);
    if (!book) {
      return res.status(404).json({ error: "Referenced book catalog entry does not exist." });
    }

    if (book.status === "Available") {
      return res.status(400).json({ error: "Book is already flagged Available in the stacks shelves." });
    }

    const borrowerId = book.borrowerId;
    const prevStatus = book.status;
    const dueDateStr = book.dueDate;

    book.status = "Available";
    book.borrowerId = undefined;
    book.borrowerName = undefined;
    book.dueDate = undefined;

    let fineAccrued = 0;
    if (borrowerId) {
      const parent = members.find(m => m.id === borrowerId);
      if (parent) {
        // Simple over-due fine simulation logic
        if (prevStatus === "Overdue" && dueDateStr) {
          const diffMs = Date.now() - new Date(dueDateStr).getTime();
          const overdueDays = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
          fineAccrued = overdueDays * 1.50; // $1.50 per day
          parent.fines += fineAccrued;
        }
      }
    }

    res.json({ 
      success: true, 
      message: "Resource checked in back to storage stacks.", 
      fineAccrued 
    });
  });

  // 9. NEW SEATING STUDY SPACE BOOKING (WITH ANTI-COLLISION VERIFICATION)
  app.post("/api/bookings", (req, res) => {
    const { spaceType, spaceName, timeSlot, bookedBy, email, bookingDate } = req.body;

    if (!spaceType || !spaceName || !timeSlot || !bookedBy || !email || !bookingDate) {
      return res.status(400).json({ error: "All profile and booking slot fields must be specified." });
    }

    // Collision Check: Only let ONE user book the same space, date, and timeslot!
    const collision = bookings.find(b => 
      b.spaceName.toLowerCase() === spaceName.toLowerCase() && 
      b.timeSlot === timeSlot && 
      b.bookingDate === bookingDate
    );

    if (collision) {
      return res.status(409).json({ 
        error: `Schedule conflict: ${spaceName} is already locked for ${timeSlot} on ${bookingDate}. Please query another slot.` 
      });
    }

    const newBooking: SpaceBooking = {
      id: "bkg-" + Date.now(),
      spaceType,
      spaceName,
      timeSlot,
      bookedBy,
      email,
      bookingDate
    };

    bookings.push(newBooking);
    res.status(210).json(newBooking);
  });

  // 10. CANCEL STUDY CARREL
  app.delete("/api/bookings/:id", (req, res) => {
    const index = bookings.findIndex(b => b.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: "Booking session not registered." });
    }
    bookings.splice(index, 1);
    res.json({ success: true, message: "Study booking canceled successfully." });
  });

  // 11. ENROLL NEW MEMBER
  app.post("/api/members", (req, res) => {
    const { name, email, accountType } = req.body;
    if (!name || !email || !accountType) {
      return res.status(400).json({ error: "Name, authentic email, and Account Role option are required parameters." });
    }

    const existing = members.find(m => m.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: "This email address is already logged to an active patron profile." });
    }

    // Auto generate sequential barcode
    const idCount = members.length + Math.floor(Math.random() * 100);
    const generatedBarcode = "TKD-" + (8000 + idCount);

    const newMember: Member = {
      id: "mem-" + Date.now(),
      name,
      email,
      barcode: generatedBarcode,
      accountType,
      joinedAt: new Date().toISOString().split('T')[0],
      fines: 0.00
    };

    members.push(newMember);

    // Dispense optional greeting welcome SMS
    smsAlerts.unshift({
      id: "sms-" + Date.now(),
      recipientPhone: "+233 24 999 " + (1000 + idCount),
      recipientPhoneFormatted: "+233 24 *** " + (1000 + idCount),
      message: `Welcome, ${name}! Your Takoradi Library Hub barcode reader scan is: ${generatedBarcode}. Join our West Africa literacy stream!`,
      sentAt: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').slice(0, 16),
      type: "Welcome",
      status: "Delivered"
    });

    res.json(newMember);
  });

  // 12. SETTLE LIABILITIES
  app.post("/api/members/:id/settle-fines", (req, res) => {
    const member = members.find(m => m.id === req.params.id);
    if (!member) {
      return res.status(404).json({ error: "Member profile ID is not documented." });
    }
    member.fines = 0.00;
    res.json({ success: true, member });
  });

  // 13. TRACK DOWNLOAD METRIC STATS
  app.post("/api/eresources/download/:id", (req, res) => {
    const item = eresources.find(e => e.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Digital book artifact index not found." });
    }
    item.downloads += 1;
    res.json({ success: true, downloads: item.downloads });
  });

  // 14. INITIATE AD-HOC EMERGENCY SMS REMINDER FOR OVERDUE MATERIALS
  app.post("/api/sms-alerts/send-reminder", (req, res) => {
    const { loanId } = req.body;
    if (!loanId) {
      return res.status(400).json({ error: "Invalid loan context identifier." });
    }

    // Reconstruct loan search string format bk_b_****
    const bookTargetId = loanId.replace("ln_b_", "");
    const book = books.find(b => b.id === bookTargetId);
    if (!book || !book.borrowerId) {
      return res.status(404).json({ error: "The selected resource does not have an active associated loan." });
    }

    const member = members.find(m => m.id === book.borrowerId);
    const phoneNum = member ? "+233 24 777 " + member.barcode.replace("TKD-", "") : "+233 24 455 1111";

    const adHocMsg: SMSAlert = {
      id: "sms-" + Date.now(),
      recipientPhone: phoneNum,
      recipientPhoneFormatted: phoneNum,
      message: `CRITICAL ALERT: Your checkout for "${book.title}" is overdue/due soon. Avoid active library privileges ban. Settle fine at Takoradi main desk.`,
      sentAt: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').slice(0, 16),
      type: "Overdue Fine Reminder",
      status: "Delivered"
    };

    smsAlerts.unshift(adHocMsg);
    res.json({ success: true, adHocMsg });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Takoradi LMS REST server online and hosting port http://0.0.0.0:${PORT}`);
  });
}

startServer();
