/** Tests for books API */

process.env.NODE_ENV = "test"

const request = require ("supertest");

const app = require("../app");
const db = require("../db");

let book_isbn;



beforeEach(async() => { 
    let result = await db.query(`INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year) VALUES ('0691161518', 'http://a.co/eobPtX2', 'Matthew Lane', 'english', 264, 'Princeton University Press', 'Power-Up: Unlocking the Hidden Mathematics in Video Games', 2017) RETURNING isbn`);
    book_isbn = result.rows[0].isbn
});



// TEST POST
describe("Create a new book", function() {
    test("POSTS /books", async function (){
        const response = (await request(app).post(`/books`).send({isbn: "0691161519",
        amazon_url: "http://a.co/eobPtX3",
        author: "Matthew Lane",
        language: "english",
        pages: 264,
        publisher: "Princeton University Press",
        title: "Power-Up: Unlocking Hidden Math in Video Games 2",
        year: 2019}));
        console.log(response);
        expect(response.statusCode).toBe(201);
        expect(response.body.book).toHaveProperty('isbn');

    });
    
});

//Tests the single book get
describe("Gets the book by isbn", function(){
    test("Retrieves book posted", async function (){
        const response = await request(app).get(`/books/${book_isbn}`)
        expect(response.body.book).toHaveProperty('isbn');
        expect(response.body.book.isbn).toBe(book_isbn);
    })
});

describe("Gets the book list", function(){
    test("Retrieves only book posted", async function (){
        const response = await request(app).get(`/books`);
        expect(response.body.books).toHaveLength(1);
        expect(response.body.books[0]).toHaveProperty('isbn');
        expect(response.body.books[0].isbn).toBe(book_isbn);
    })
})

describe("Try invalid book", function(){
    test("tries to post an incomplete book", async function(){
        const response = await request(app).post(`/books`).send({isbn: "100000"});
        expect(response.statusCode).toBe(400);
    });
})

//DB cleanup
afterEach(async function () {
    await db.query("DELETE FROM BOOKS");
});

afterAll(async function () {
    await db.end()
});