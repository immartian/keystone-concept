const path = require('path')

module.exports = {
  chunkKeyLen:32,
  chunkCipher:'aes-256-cbc',
  chunkHashAlg:'md5',
  inputFilesDir:path.resolve(__dirname + '/filestore/'),
  chunksDir:path.resolve(__dirname + '/chunks/'),
  chunksFilePrefx:'chunk_',
  chunksExtension:'.musicoin',
  keystoneKeyLen:32,
  keystoneCipher:'aes-256-cbc',
  keystonesDir:path.resolve(__dirname + '/keystones/'),
  keystoneFname:'keystone.musicoin',
  outPortIn:9999,
  outPortOut:19999,
  staticFilesIn:'publicSender',
  staticFilesOut:'publicReceiver',
  publicKey:`-----BEGIN PUBLIC KEY-----
  MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAt3WB+Byf0RvLdubOUY5Z
  RQRdywyVi3J7kgeCFzrhyWCuQ58nyvLhDeMYV8aKCXvAu4ASqoTz0TK/hrfVHFuC
  E7ervKgmKbDOUeYXLVZJJSUyFhoh2ztvNAY1XZVB0Ie+VoN5FqGQ3FVf9zYgtNr2
  5w4qjBXqxmvUhZ9TmW7FZd39v2UrWAbHeLgiZ3H1TDgvPv3cC+cbmZN1Vqqm33yY
  mTnKKzT56RnJ508PyJYChpohZ/PFenCWy6DvoFJ4ySpiAm0iOhXHpvFiD1VFglFB
  9WY8k/bpIeGKhjHTAFjjq/Tx3rlgA8HX05FyB9ce7LhmSRZGL/0v34DViawedz/a
  PwIDAQAB
  -----END PUBLIC KEY-----`,
  privateKey:`-----BEGIN RSA PRIVATE KEY-----
  MIIEowIBAAKCAQEAt3WB+Byf0RvLdubOUY5ZRQRdywyVi3J7kgeCFzrhyWCuQ58n
  yvLhDeMYV8aKCXvAu4ASqoTz0TK/hrfVHFuCE7ervKgmKbDOUeYXLVZJJSUyFhoh
  2ztvNAY1XZVB0Ie+VoN5FqGQ3FVf9zYgtNr25w4qjBXqxmvUhZ9TmW7FZd39v2Ur
  WAbHeLgiZ3H1TDgvPv3cC+cbmZN1Vqqm33yYmTnKKzT56RnJ508PyJYChpohZ/PF
  enCWy6DvoFJ4ySpiAm0iOhXHpvFiD1VFglFB9WY8k/bpIeGKhjHTAFjjq/Tx3rlg
  A8HX05FyB9ce7LhmSRZGL/0v34DViawedz/aPwIDAQABAoIBABMNWv//SQGYV1rz
  wT1rAQ5P08XAes9OhlK2AOaUsNoO9koDf0huTLz6do63CaLOfUd7l3Sp9gAluwos
  kS8uuaV+j5E6DSyLNgH/WSzWJyZ6ZGczM4zm8Td/5Y7gb0NOtY+ae7rD8J1RKHQt
  5NujWbzJFdYSeJ0+mYV+9FmczVc0tzDYubwdPmOJRpRV/7DXbzZWCFB80YYC6Pib
  NM5285OwK1FjW7ilJKSnDkYpznY5q8ipDlgP53kuVTloYaI//c4yoOg14ltmsWZ0
  5XqjanBTMhnRzwhgoZD3Lk9ZYRMU6jXMCZBsjo43XWNPLmrER6sEob3+EHeQpEe3
  1DGmtRECgYEA+QRwdxRZ4a3fXSfOSF9ZaH+Y/e7JC80i8B5Ho33hrkestBe4OSIo
  k7/iZ9wU71oYlBsS2cOHf4fwUaPHaeVvAFS9jDAirb114omAezgFSHmW87JtYxmp
  cerBldC6uut16vqSjn24AQqU2ANVMnWK+bR4uojq6FvL0/OlWBp2bl0CgYEAvJp1
  7G2KWWNYk/0xBwQ5RfdkUQrLYtGdKzDbeZOQwgwzYH41xYQuxkxMH2o068DZpK8E
  6sULQwGSb4FpBBu3Kq4LstHMyfjKFLs7U/l38TfkjuE9XGyV6EA7+6SIjYouopX7
  D1frVb2OG2JLi1k16JUONUSHxI6SyIzE9DIZSUsCgYEAjWVs6uDebJwLEd1Rb5zc
  qs6RM9dLx2yy4v9+lCIdbJV8RkKVs7NmsQaq62h3ZrWU8TwyRv6UyOCKoADMcZ/6
  mIiFnL2UY20KLBkBoHXd4hpQkY4GONhQc8PmKkh8Tzj2GvgvEcPnIIg+ni2+Scme
  oU1NpDWslUXShkZ5434bM20CgYA44UiRPlQMM1cCgsinehGf1UWO33eJXPhOj1SR
  rPxqWW2hO08SO5Qzv8zxaIF/XFEHRrVv7G9CDRZRxLCcSZOLLqRekMF3ZC3l5LW2
  1LTkrdujb7Cm0CTBv6WXdf6s2TDJXfwym2xhFmLmRVXNN+F3PITlcb6Ue/8utq2r
  i/RuUwKBgDrb+JpDY6ttKamX0MQef7pQ+7SjOpxskjjtoiIwN8TIihIUZC6SmRIo
  yv5eQNhTnIjL1sfTI0Ob2xn6Bcsldku73PiDobk4QN71FsB6b/hZ+Hb4SaC6GnW/
  F2Fw02RwNWOVDDpCQ2LGijZ1aRNYzqtgiRa7tiIXH3Y+Ry4EfXTj
  -----END RSA PRIVATE KEY-----`
}
