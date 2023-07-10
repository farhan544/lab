const express = require('express');
const bodyParser = require('body-parser');
const koneksi = require('./config/database');
const app = express();
const PORT = process.env.PORT || 5000;

const multer = require('multer')
const path = require('path')
var cors = require('cors');

// set body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({
    origin: '*'
}));


// script upload

app.use(express.static("./public"))
 //! Use of Multer
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/images/')     // './public/images/' directory name where save the file
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
 
var upload = multer({
    storage: storage
}); 

// create data / insert data
app.post('/api/buku',upload.single('image'),(req, res) => {


    const data = { ...req.body };
     const isbn = req.body.isbn;
    const judul = req.body.judul;
    const tahun_terbit = req.body.tahun_terbit;
    const penulis = req.body.penulis;

    if (!req.file) {
        console.log("No file upload");
        const querySql = 'INSERT INTO buku (isbn,judul,tahun_terbit,penulis) values (?,?,?,?);';
         
        // jalankan query
        koneksi.query(querySql,[ isbn,judul, tahun_terbit,penulis], (err, rows, field) => {
            // error handling
            if (err) {
                return res.status(500).json({ message: 'Gagal insert data!', error: err });
            }
       
            // jika request berhasil
            res.status(201).json({ success: true, message: 'Berhasil insert data!' });
        });
    } else {
        console.log(req.file.filename)
        var imgsrc = 'http://localhost:5000/images/' + req.file.filename;
        const foto =   imgsrc;
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const querySql = 'INSERT INTO buku (isbn,judul,tahun_terbit,penulis,foto) values (?,?,?,?,?);';
 
// jalankan query
koneksi.query(querySql,[ isbn,judul, tahun_terbit,penulis,foto], (err, rows, field) => {
    // error handling
    if (err) {
        return res.status(500).json({ message: 'Gagal insert data!', error: err });
    }

    // jika request berhasil
    res.status(201).json({ success: true, message: 'Berhasil insert data!' });
});
}
});

// read data / get data
app.get('/api/buku', (req, res) => {
    // buat query sql
    const querySql = 'SELECT * FROM buku';

    // jalankan query
    koneksi.query(querySql, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika request berhasil
        res.status(200).json({ success: true, data: rows });
    });
});

// update data
app.put('/api/buku/:isbn', (req, res) => {
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const querySearch = 'SELECT * FROM buku WHERE isbn = ?';
    const isbn = req.body.isbn;
    const judul = req.body.judul;
    const tahun_terbit = req.body.tahun_terbit;
    const penulis = req.body.penulis;

    const queryUpdate = 'UPDATE buku SET judul=?,tahun_terbit=?,penulis=? WHERE isbn = ?';

    // jalankan query untuk melakukan pencarian data
    koneksi.query(querySearch, req.params.isbn, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika id yang dimasukkan sesuai dengan data yang ada di db
        if (rows.length) {
            // jalankan query update
            koneksi.query(queryUpdate, [judul,tahun_terbit,penulis, req.params.isbn], (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }

                // jika update berhasil
                res.status(200).json({ success: true, message: 'Berhasil update data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});

// delete data
app.delete('/api/buku/:isbn', (req, res) => {
    // buat query sql untuk mencari data dan hapus
    const querySearch = 'SELECT * FROM buku WHERE isbn = ?';
    const queryDelete = 'DELETE FROM buku WHERE isbn = ?';

    // jalankan query untuk melakukan pencarian data
    koneksi.query(querySearch, req.params.isbn, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika id yang dimasukkan sesuai dengan data yang ada di db
        if (rows.length) {
            // jalankan query delete
            koneksi.query(queryDelete, req.params.isbn, (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }

                // jika delete berhasil
                res.status(200).json({ success: true, message: 'Berhasil hapus data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});

// buat server nya
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));
