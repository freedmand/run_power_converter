const bufferData = `c0 02 1d 77 ee 64 09 18 10 b7 05 1f 20 f4 13 11 0e 14 23 09
00 74 0b 02 1d 14 11 0e 1c bb f6 8e 1f 16 e0 68 9b 1d 22 0a
40 9b 0a 13 0a a4 15 16 19 14 e0 ae ed 1b 71 10 68 17 ab 0f
80 1b 6a 1e 91 71 a5 20 0d 1a 14 d6 15 af 0f 07 1f 0e 23 fb
c0 86 1d 68 ee 64 04 18 10 b7 0c 16 20 f8 19 11 0e 14 23 89
00 6b 8f 07 14 14 18 0e 1c bb f6 77 1f 16 e3 68 ba 1d 22 0a
40 62 0a 13 0a a4 10 16 19 14 e0 a8 e4 18 70 15 6c 17 8a 0f
80 1b 6e 1b 6e 71 a3 20 0d 4a 14 d1 15 af 0f 04 1c 0e 23 fb
c0 ff 1d 6d ee 64 07 18 10 b7 0c 16 20 f8 49 11 0e 14 23 76
00 6e f6 07 14 14 18 0e 1c bb f6 73 1f 16 e3 68 9a 1d 22 0a
40 66 0a 13 0a a4 10 16 19 14 e0 d0 fa 18 71 1f 6c 17 aa 0f
80 1b 6e 11 6c 71 db 20 0d 15 14 d6 15 af 0f 04 1c 0e 23 fb
c0 bd 1d 68 ee 64 07 18 10 b7 0c 16 20 fa 16 11 0e 14 23 74
00 6b b4 19 14 14 18 0e 1c bb f6 8a 1f 16 03 97 fe 1d 22 0a
40 9f 0a 13 0a a4 0e 16 19 14 e0 3f c1 07 71 10 6a 17 ce 0f
80 1b 68 14 6a 71 34 20 0d fd 14 ce 15 af 0f 18 03 0e 23 fb
c0 10 1d 6d ee 64 1a 18 10 b7 11 1c 20 ef 4c 11 0e 14 23 8b
00 6e 19 1c 14 14 05 0e 1c bb f6 8d 1f 16 fc 68 ae 1d 22 0a
40 98 0a 13 0a a4 0b 16 19 14 e0 d4 fe 02 71 02 6d 17 9e 0f
80 1b 6f 0c 90 71 df 20 0d 28 14 d7 15 af 0f 1f 06 0e 23 fb
c0 f5 1d 6f ee 64 1c 18 10 b7 16 16 20 e0 2b 11 0e 14 23 88
00 6c fc 1d 01 14 02 0e 1c bb f6 8e 1f 16 fd 68 9b 1d 22 0a
40 9b 0a 13 0a a4 0a 16 19 14 e0 e9 ef 07 71 05 6c 17 ab 0f
80 1b 6e 1e 6c 71 e2 20 0d 59 14 d0 15 af 0f 1a 03 0e 23 fb
c0 2b 1d 94 ee 64 19 18 10 b7 12 16 20 f4 5a 11 0e 14 23 74
00 97 22 18 14 14 06 0e 1c bb f6 8e 1f 16 fe 68 2a 1d 22 0a
40 9b 0a 13 0a a4 0f 16 19 14 e0 b7 e7 04 71 03 6f 17 1a 0f
80 1b 6d 0d 91 70 bc 20 0d 19 14 d7 15 af 0f 19 00 0e 23 fb
c0 1b 1d 6f ee 64 1a 18 10 b7 13 16 20 fe 1a 11 0e 14 23 89
00 6c 12 18 14 14 07 0e 1c bb f6 70 1f 16 f6 68 e3 1d 22 0a
40 65 0a 13 0a a4 0f 16 19 14 e0 16 e0 06 71 10 69 17 d3 0f
80 1b 6b 1e 93 71 1d 20 0d 7a 14 d3 15 af 0f 04 02 0e 23 fb
c0 d0 1d 62 ee 64 07 18 10 b7 09 16 20 fa 79 11 0e 14 23 8b
00 61 d9 03 14 14 1d 0e 1c bb f6 8d 1f 16 eb 68 df 1d 22 0a
40 98 0a 13 0a a4 14 16 19 14 e0 60 e8 10 71 10 4c 17 ef 0f
80 1b 4e 1e 11 71 6b 20 0d 10 14 d8 15 af 0f 0a 14 0e 23 fb
c0 1a 1d 14 ee 64 09 18 10 b7 02 16 20 f0 13 11 0e 14 23 09
00 17 13 09 14 14 16 0e 1c bb f6 0d 1f 16 ee 68 12 1d 22 0a
40 18 0a 13 0a a4 1e 16 19 14 e0 1a e8 16 71 10 16 17 22 0f
80 1b 14 1e 11 71 11 20 0d 10 14 dc 15 af 0f 0a 12 0e 23 fb
c0 1a 1d 14 ee 64 09 18 10 b7 02 16 20 f2 13 11 0e 14 23 09
00 17 13 09 14 14 16 0e 1c bb f6 0d 1f 16 ec 68 12 1d 22 0a
40 18 0a 13 0a a4 1e 16 19 14 e0 1a eb 16 71 10 16 17 22 0f
80 1b 14 1e 11 71 11 20 0d 10 14 dc 15 af 0f 0a 12 0e 23 fb
c0 1a 1d 14 ee 64 09 18 10 b7 02 16 20 f3 13 11 0e 14 23 09
00 17 13 09 14 14 16 0e 1c bb f6 0d 1f 16 ed 68 12 1d 22 0a
40 18 0a 13 0a a4 1e 16 19 14 e0 1a eb 16 71 10 16 17 22 0f
80 1b 14 1e 11 71 11 20 0d 10 14 dc 15 af 0f 0a 12 0e 23 fb
c0 1a 1d 14 ee 64 09 18 10 b7 02 16 20 f3 13 11 0e 14 23 09
00 17 13 09 14 14 16 0e 1c bb f6 0d 1f 16 ed 68 12 1d 22 0a
40 18 0a 13 0a a4 1e 16 19 14 e0 1a eb 16 71 10 16 17 22 0f
80 1b 14 1e 11 71 11 20 0d 10 14 dc 15 af 0f 0a 12 0e 23 fb
c0 1a 1d 14 ee 64 09 18 10 b7 02 16 20 f3 13 11 0e 14 23 09
00 17 13 09 14 14 16 0e 1c bb f6 0d 1f 16 ed 68 12 1d 22 0a
40 18 0a 13 0a a4 1e 16 19 14 e0 1a eb 16 71 10 16 17 22 0f
80 1b 14 1e 11 71 11 20 0d 10 14 dc 15 af 0f 0a 12 0e 23 fb
c0 1a 1d 14 ee 64 09 18 10 b7 02 16 20 f3 13 11 0e 14 23 09
00 17 13 09 14 14 16 0e 1c bb f6 0d 1f 16 ed 68 12 1d 22 0a
40 18 0a 13 0a a4 1e 16 19 14 e0 1a eb 16 71 10 16 17 22 0f
80 1b 14 1e 11 71 11 20 0d 10 14 dc 15 af 0f 0a 12 0e 23 fb
c0 1a 1d 14 ee 64 09 18 10 b7 02 16 20 f3 13 11 0e 14 23 09
00 17 13 03 14 14 16 0e 1c bb f6 8d 1f 16 e9 68 ab 1d 22 0a
40 98 0a 13 0a a4 14 16 19 14 e0 e9 ee 1a 71 10 92 17 9b 0f
80 1b 90 1e 6d 71 e2 20 0d e6 14 db 15 af 0f 04 1e 0e 23 fb
c0 4f 1d 94 ee 64 07 18 10 b7 0d 16 20 f5 e5 11 0e 14 23 75
00 97 46 19 17 14 19 0e 1c bb f6 8f 1f 16 e2 68 15 1d 22 0a
40 9a 0a 13 0a a4 0e 16 19 14 e0 17 e3 06 71 13 69 17 25 0f
80 1b 6b 1e 6f 71 1c 20 0d 8c 14 d6 15 af 0f 1a 02 0e 23 fb
c0 28 1d 95 ee 64 19 18 10 b7 12 19 20 e1 8f 11 0e 14 23 77`;

const testData = bufferData.split('\n').filter(x => x.trim().length > 0).map(line => {
  const parts = line.split(' ').filter(x => x.trim().length > 0).map(x => parseInt(x.trim(), 16));
  const buffer = Buffer.from(parts);
  return buffer;
});

module.exports = { testData };

console.log(testData);
