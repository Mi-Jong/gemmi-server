const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const db = require('./db_connection');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 5000;
const url = "https://m.stock.naver.com/api/stocks/searchTop/all?page=1&pageSize=20";

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

// 가상주식시뮬레이션 값 가져옴
app.get('/api/vitualRanking', (req, res) => {
    const query = 'SELECT username, vitualGame FROM gemmi WHERE vitualGame IS NOT NULL';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching data from the database:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results);
    });
});

// 주식단어게임 값 가져옴
app.get('/api/wordRanking', (req, res) => {
    const query = 'SELECT username, wordGame FROM gemmi WHERE wordGame IS NOT NULL ORDER BY wordGame DESC';
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching data from the database:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
      res.json(results);
    });
  });


// 사용자 값 가져옴
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

  let column;
  if (type === 'virtual') {
      column = 'vitualGame';
  } else if (type === 'word') {
      column = 'wordGame';
  } else {
      return res.status(400).json({ error: 'Invalid game type' });
  }

  const query = `INSERT INTO gemmi (username, ${column}) VALUES (?, ?)`;

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