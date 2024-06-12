const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const helmet = require('helmet'); 
const db = require('./db_connection');

const app = express();
const port = process.env.PORT || 5000;
const url = "https://m.stock.naver.com/api/stocks/searchTop/all?page=1&pageSize=20";

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true }));
app.use(cors());

// 인기주식 json파일로 만들어 띄우기
app.get('/api/data', async (req, res) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        res.json(data); // JSON 형태로 데이터를 클라이언트에 전송
    } catch (error) {
        console.error('There was a problem with your fetch operation:', error);
        res.status(500).send('Internal Server Error');
    }
});

// 가상 주식 게임 랭킹을 가져오는 엔드포인트
app.get('/api/virtualRanking', (req, res) => {
    const query = 'SELECT username, Score FROM virtualGame ORDER BY Score DESC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching data from the database:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results);
    });
});

// 단어 게임 랭킹을 가져오는 엔드포인트
app.get('/api/wordRanking', (req, res) => {
    const query = 'SELECT username, Score FROM WordGame ORDER BY Score DESC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching data from the database:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results);
    });
});

// 사용자의 게임 기록을 저장하는 엔드포인트
app.post('/api/saveUser/:type/:userName/:userScore', (req, res) => {
    const { type, userName, userScore } = req.params;

    console.log('Received data:', { type, userName, userScore });

    if (!userName || userScore === null || userScore === undefined) {
        return res.status(400).json({ error: 'userName and userScore are required' });
    }

    if (isNaN(userScore)) {
        return res.status(400).json({ error: 'userScore must be a number' });
    }

    const decodedUserName = decodeURIComponent(userName);

    let query;
    if (type === 'virtual') {
        query = 'INSERT INTO virtualGame (username, Score) VALUES (?, ?)';
    } else if (type === 'word') {
        query = 'INSERT INTO WordGame (username, Score) VALUES (?, ?)';
    } else {
        return res.status(400).json({ error: 'Invalid game type' });
    }

    db.query(query, [decodedUserName, userScore], (err, result) => {
        if (err) {
            console.error('Error inserting data into the database:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(200).json({ message: 'User name and score saved successfully' });
    });
});


// build 폴더를 static 폴더로 사용하도록 수정
// (build 폴더의 경로는 이름 바꾸거나 수정이 가능함)
// app.use(express.static(path.join(__dirname, '/build')));

// // 그 외 요청은 모두 리액트에서 빌드한 폴더의 index.html 보내기
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname + '/build/index.html'));
// });


app.listen(port, ()=> console.log(`listening on port ${port}`))