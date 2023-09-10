import { writeFile, appendFile } from 'fs/promises';
import { writeFileSync, appendFileSync, write, createWriteStream } from 'fs';
import path from 'path';

type OntimeDump = {
    startedAt: number | null;
    playback: string;
    selectedEventId: string | null;
    addedTime: number | null;
}

let oldStore: string = ''

async function override(store: Partial<OntimeDump>, dumpPath: string = __dirname + '/../dump/test.json'): Promise<void> {
    writeFile(path.normalize(dumpPath), JSON.stringify(store), 'utf-8').
        catch((err) => { console.error('DUMP', 'failde to dump state, ' + err) });
}

function overrideSync(store: Partial<OntimeDump>, dumpPath: string = __dirname + '/../dump/test.json'): void {
    writeFileSync(path.normalize(dumpPath), JSON.stringify(store), 'utf-8');
}

async function append(store: Partial<OntimeDump>, dumpPath: string = __dirname + '/../dump/test.json'): Promise<void> {
    appendFile(path.normalize(dumpPath), JSON.stringify(store) + '\n', 'utf-8').
        catch((err) => { console.error('DUMP', 'failde to dump state, ' + err) });
}

function appendSync(store: Partial<OntimeDump>, dumpPath: string = __dirname + '/../dump/test.json'): void {
    appendFileSync(path.normalize(dumpPath), JSON.stringify(store) + '\n', 'utf-8');
}

async function appendMinimize(store: Partial<OntimeDump>, dumpPath: string = __dirname + '/../dump/test.csv'): Promise<void> {
    let data = (store.startedAt?.toString() ?? '') + ',' + (store.playback ?? '') + ',' + (store.selectedEventId ?? '') + ',' + (store.addedTime?.toString() ?? '');
    appendFile(path.normalize(dumpPath), data + '\n', 'utf-8').
        catch((err) => { console.error('DUMP', 'failde to dump state, ' + err) });
}


function appendStream(store: Partial<OntimeDump>): void {
    writeStream.write(JSON.stringify(store) + '\n', 'utf-8');
}

async function test(name: string, fun: Function, data: OntimeDump, repeat: number = 1, mod: number = 0) {
    console.time(name);
    for (let i = 0; i < repeat; i++) {
        await fun(data);
    }
    console.timeEnd(name);
}

const rep = 100;


test('override', override, { startedAt: 123456789, playback: 'play', selectedEventId: 'asfe', addedTime: 12874 }, rep);
test('append', append, { startedAt: 123456789, playback: 'play', selectedEventId: 'asfe', addedTime: 12874 }, rep);

test('overrideSync', overrideSync, { startedAt: 123456789, playback: 'play', selectedEventId: 'asfe', addedTime: 12874 }, rep);
test('appendSync', appendSync, { startedAt: 123456789, playback: 'play', selectedEventId: 'asfe', addedTime: 12874 }, rep);
test('appendMinimize', appendMinimize, { startedAt: 123456789, playback: 'play', selectedEventId: 'asfe', addedTime: 12874 }, rep);

console.time('createWriteStream');
let writeStream = createWriteStream(path.normalize(__dirname + '/../dump/testStream.json'), { autoClose: false });
console.timeEnd('createWriteStream');

test('appendStream', appendStream, { startedAt: 123456789, playback: 'play', selectedEventId: 'asfe', addedTime: 12874 }, rep).then(() => {
    console.time('writeStream.end');
    writeStream.end();
    console.timeEnd('writeStream.end');
});

