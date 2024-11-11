const books = [];
const RENDER_EVENT = "render-book";

//membuat event listener untuk element HTML yang diperlukan
document.addEventListener("DOMContentLoaded", () => {
  loadDataFromStorage();
  const bookForm = document.getElementById("bookForm");
  bookForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const bookId = document.getElementById("bookId").value;
    if (bookId) {
      saveEditBook(parseInt(bookId));
    } else {
      addBook();
    }
    document.getElementById("bookId").value = "";
  });
});

const searchForm = document.getElementById("searchBook");
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const inputSearch = document.querySelector("#searchBookTitle").value;
  searchBook(inputSearch);
});

//membuat fungsi menambahkan buku
const addBook = () => {
  const title = document.getElementById("bookFormTitle").value;
  const author = document.getElementById("bookFormAuthor").value;
  const year = Number(document.getElementById("bookFormYear").value);
  const isComplete = document.getElementById("bookFormIsComplete").checked;

  const generatedID = generateId();
  const bookObject = generateBooksObject(
    generatedID,
    title,
    author,
    year,
    isComplete
  );

  books.push(bookObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

//membuat fungsi untuk mengenerate ID
const generateId = () => {
  return +new Date().getTime();
};

//membuat fungsi untuk mendapatkan objek buku
function generateBooksObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

//membuat fungsi untuk merender input untuk element buku di DOM
function bookElement(bookObject) {
  //judul buku
  const titleBook = document.createElement("h3");
  titleBook.setAttribute("data-testid", "bookItemTitle");
  titleBook.innerText = bookObject.title;
  //penulis buku
  const authorBook = document.createElement("p");
  authorBook.setAttribute("data-testid", "bookItemAuthor");
  authorBook.innerText = "Penulis : " + bookObject.author;
  //tahun buku
  const yearBook = document.createElement("p");
  yearBook.setAttribute("data-testid", "bookItemYear");
  yearBook.innerText = "Tahun : " + bookObject.year;
  //menampilkan container untuk elemen buku
  const container = document.createElement("div");
  container.setAttribute("data-bookid", bookObject.id);
  container.setAttribute("data-testid", "bookItem");
  container.classList.add("itemBook");
  container.append(titleBook, authorBook, yearBook);

  //menampilkan tombol edit
  const buttonEdit = document.createElement("button");
  buttonEdit.setAttribute("data-testid", "bookItemEditButton");
  buttonEdit.classList.add("edit-button");
  buttonEdit.innerHTML = `<i class='bx bx-edit-alt'></i>`;
  buttonEdit.addEventListener("click", () => {
    editBook(bookObject.id);
  });

  //menampilkan tombol hapus
  const buttonDelete = document.createElement("button");
  buttonDelete.setAttribute("data-testid", "bookItemDeleteButton");
  buttonDelete.classList.add("delete-button");
  buttonDelete.innerHTML = `<i class='bx bx-trash'></i>`;
  buttonDelete.addEventListener("click", () => {
    removeBookFromComplete(bookObject.id);
  });

  //membuat logika tombol berdasarkan status buku
  if (bookObject.isComplete) {
    const buttonUndo = document.createElement("button");
    buttonUndo.setAttribute("data-testid", "bookItemIsCompleteButton");
    buttonUndo.classList.add("undo-button");
    buttonUndo.innerHTML = `<i class='bx bx-check'></i>`;
    buttonUndo.addEventListener("click", () => {
      undoBookFromComplete(bookObject.id);
    });

    container.append(buttonUndo, buttonEdit, buttonDelete);
  } else {
    const buttonComplete = document.createElement("button");
    buttonComplete.setAttribute("data-testid", "bookItemIsCompleteButton");
    buttonComplete.classList.add("complete-button");
    buttonComplete.innerHTML = `<i class='bx bx-check'></i>`;
    buttonComplete.addEventListener("click", () => {
      addBookToComplete(bookObject.id);
    });

    container.append(buttonComplete, buttonEdit, buttonDelete);
  }

  return container;
}

//membuat fungsi untuk mencari id buku
function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

//membuat fungsi untuk memindahkan buku ke status "sudah dibaca"
function addBookToComplete(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

//membuat fungsi untuk menghapus buku
function removeBookFromComplete(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;
  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

//membuat fungsi untuk mengembalikan buku ke status "belum selesai dibaca"
function undoBookFromComplete(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

//membuat fungsi untuk mencari buku berdasarkan ID
function findBookIndex(bookId) {
  for (const i in books) {
    if (books[i].id === bookId) {
      return i;
    }
  }
  return -1;
}

//membuat fungsi untuk mengedit buku
function editBook(bookId) {
  const book = books.find((book) => book.id === bookId);
  if (!book) return;
  document.getElementById("bookFormTitle").value = book.title;
  document.getElementById("bookFormAuthor").value = book.author;
  document.getElementById("bookFormYear").value = book.year;
  document.getElementById("bookFormIsComplete").checked = book.isComplete;
  document.getElementById("bookForm").scrollIntoView({ behavior: "smooth" });
  document.getElementById("bookId").value = bookId;
}

//membuat fungsi untuk menyimpan hasil edit buku
function saveEditBook(bookId) {
  const bookIndex = books.findIndex((book) => book.id === bookId);
  if (bookIndex === -1) return;
  books[bookIndex].title = document.getElementById("bookFormTitle").value;
  books[bookIndex].author = document.getElementById("bookFormAuthor").value;
  books[bookIndex].year = Number(document.getElementById("bookFormYear").value);
  books[bookIndex].isComplete =
    document.getElementById("bookFormIsComplete").checked;

  alert("Buku berhasil di edit");
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

//membuat fungsi untuk memfilter kolom pencarian
let searchQuery = "";

function searchBook(query) {
  searchQuery = query.toLowerCase();
  const item = document.querySelectorAll("[data-testid='bookItemTitle']");
  if (searchQuery == "") {
    item.forEach((n) => {
      n.parentElement.parentElement.style.display = "block";
    });
  } else {
    item.forEach((n) => {
      if (n.textContent.toLowerCase() != searchQuery) {
        n.parentElement.parentElement.style.display = "None";
      } else {
        n.parentElement.parentElement.style.display = "Block";
      }
    });
  }
}

function getFilteredBook() {
  if (searchQuery === "") {
    return books;
  }
  return books.filter((book) => book.title.toLowerCase().includes(searchQuery));
}

//--------MERENDER KE HTML--------
document.addEventListener(RENDER_EVENT, () => {
  const incompleteBookList = document.getElementById("incompleteBookList");
  incompleteBookList.innerHTML = "";

  const completeBookList = document.getElementById("completeBookList");
  completeBookList.innerHTML = "";

  const filteredBook = getFilteredBook();
  for (const bookItemSearch of filteredBook) {
    const bookElementInside = bookElement(bookItemSearch);

    if (!bookItemSearch.isComplete) {
      incompleteBookList.append(bookElementInside);
    } else {
      completeBookList.append(bookElementInside);
    }
  }
});

//STORAGE
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "Bookshelf-Apps";

//memeriksa browser mendukung fitur web storage
function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}
//membuat fungsi untuk menyimpan data ke web storage
function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

//menambahkan fungsi untuk memuat data
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}