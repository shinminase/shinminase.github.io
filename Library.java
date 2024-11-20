class Book {
    private String title;
    private String author;
    private String datePublished;

    public Book(String title, String author, String datePublished) {
        this.title = title;
        this.author = author;
        this.datePublished = datePublished;
    }

    public String getTitle() {
        return title;
    }

    public String getAuthor() {
        return author;
    }

    public String getDatePublished() {
        return datePublished;
    }

    public void displayInfo() {
        System.out.println("Book Title: " + title);
        System.out.println("Book Author: " + author);
        System.out.println("Date Published: " + datePublished);
    }

    public void checkAvailability() {
        System.out.println("You can borrow the book.");
    }
}

class BorrowedBook extends Book {
    private String dateBorrowed;
    private String dateReturn;
    private String borrower;

    public BorrowedBook(String title, String author, String datePublished, String dateBorrowed, String dateReturn, String borrower) {
        super(title, author, datePublished);
        this.dateBorrowed = dateBorrowed;
        this.dateReturn = dateReturn;
        this.borrower = borrower;
    }


    public void displayInfo() {
        super.displayInfo();
        System.out.println("Date Borrowed: " + dateBorrowed);
        System.out.println("Date Return: " + dateReturn);
        System.out.println("Borrower: " + borrower);
    }

    public void checkBorrowStatus() {
        if (borrower != null) {
            System.out.println("The book has been borrowed.");
        } else {
            System.out.println("You can borrow the book.");
        }
    }
}

public class Library {
    public static void main(String[] args) {
        Book[] books = new Book[11];

        books[0] = new Book("The Great Gatsby", "F. Scott Fitzgerald", "1925");
        books[1] = new BorrowedBook("1984", "George Orwell", "1949", "Nov 1, 2024", "Nov 15, 2024", "John Doe");
        books[2] = new Book("To Kill a Mockingbird", "Harper Lee", "1960");
        books[3] = new BorrowedBook("Moby Dick", "Herman Melville", "1851", "Nov 5, 2024", "Nov 20, 2024", "Jane Smith");
        books[4] = new Book("Divine Comedy", "Dante Alighieri", "1472");
        books[5] = new BorrowedBook("Pride and Prejudice", "Jane Austen", "1813", "Nov 10, 2024", "Nov 20, 2024", "Utena Tenjou");
        books[6] = new BorrowedBook("Pale Fire", "Vladimir Nabokov", "1962", "Nov 8, 2024", "Nov 22, 2024", "Gazelle Anne Taca");
        books[7] = new Book("A Study In Scarlet", "Arthur Conan Doyle", "1887");
        books[8] = new BorrowedBook("Lolita", "Vladimir Nabokov", "1955", "January 6, 2024", "Not returned yet", "P. Diddy");
        books[9] = new Book("Red Dragon", "Thomas Harris", "1981");
        books[10] = new BorrowedBook("A Clockwork Orange", "Anthony Burgess", "1962", "September 9, 2024", "Not returned yet", "Lia Vega");

        
        int index = 6;

        books[index].displayInfo();

        if (books[index] instanceof BorrowedBook) {
            ((BorrowedBook) books[index]).checkBorrowStatus();
        } else {
            books[index].checkAvailability();
        }
    }
}
