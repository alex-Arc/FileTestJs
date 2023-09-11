import { readFileSync, writeFileSync, createWriteStream } from 'fs'
import { mkdtemp, writeFile } from 'fs/promises'
import os from 'os'
import path from 'path'

import { Writer } from 'steno'

async function benchmark(data, msg) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'steno-'))
  const fsLabel = '  fs     '
  const fsSyncLabel = '  fsSync '
  const fsStreamLabel = '  fsStream '
  const stenoLabel = '  steno  '
  const fsFile = path.join(dir, 'fs.txt')
  const fsSyncFile = path.join(dir, 'fsSync.txt')
  const fsStreamFile = path.join(dir, 'fsStream.txt')
  const stenoFile = path.join(dir, 'steno.txt')
  const steno = new Writer(stenoFile)
  const stream = createWriteStream(fsStreamFile, 'utf-8', { autoClose: false })

  // console.log(`temp dir: ${dir}`)
  console.log(msg)
  console.log()

  console.time(fsLabel)
  // To avoid race condition issues, we need to wait
  // between write when using fs only
  for (let i = 0; i < 1000; i++) {
    await writeFile(fsFile, `${data}${i}`)
  }
  console.timeEnd(fsLabel)

  console.time(fsSyncLabel)
  // To avoid race condition issues, we need to wait
  // between write when using fs only
  for (let i = 0; i < 1000; i++) {
    writeFileSync(fsSyncFile, `${data}${i}`)
  }
  console.timeEnd(fsSyncLabel)

  console.time(fsStreamLabel)
  // To avoid race condition issues, we need to wait
  // between write when using fs only
  for (let i = 0; i < 1000; i++) {
    stream.write(`${data}${i}`)
  }
  console.timeEnd(fsStreamLabel)


  console.time(stenoLabel)
  // Steno can be run in parallel !!!We wont be running it in paralell
  for (let i = 0; i < 1000; i++) {
    await steno.write(`${data}${i}`)
  }
  console.timeEnd(stenoLabel)

  stream.end();
  // Testing that the end result is the same
  console.log()
  console.log(
    '  fs.txt = steno.txt',
    readFileSync(fsFile, 'utf-8') === readFileSync(stenoFile, 'utf-8')
      ? '✓'
      : '✗',
  )
  console.log(
    '  fsSync.txt = steno.txt',
    readFileSync(fsSyncFile, 'utf-8') === readFileSync(stenoFile, 'utf-8')
      ? '✓'
      : '✗',
  )
  console.log(
    '  fsStream.txt = steno.txt',
    readFileSync(fsStreamFile, 'utf-8') === readFileSync(stenoFile, 'utf-8')
      ? '✓'
      : '✗',
  )
  console.log()
  console.log()
}

async function run() {
  const ten = 10
  const small = 50
  const KB = 1024
  const MB = 1048576
  await benchmark(
    Buffer.alloc(ten, 'x').toString(),
    'Write 10 bytes to the same file x 1000',
  )
  await benchmark(
    Buffer.alloc(small, 'x').toString(),
    'Write 50 bytes to the same file x 1000',
  )
  await benchmark(
    Buffer.alloc(KB, 'x').toString(),
    'Write 1KB data to the same file x 1000',
  )
  // await benchmark(
  //   Buffer.alloc(MB, 'x').toString(),
  //   'Write 1MB data to the same file x 1000',
  // )
}

void run()