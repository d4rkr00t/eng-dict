import fs from 'fs';
import _ from 'lodash';

const { forEach, map } = _;

const MAX_DIST = 2000;

function prepeareSubtitles(subtitles) {

  subtitles = subtitles.split(/\n\s*\n/gmi);

  subtitles = _(subtitles).map(item => {

    item = item.split('\n');

    if (item.length < 2) {
      return null;
    }

    const time = item[1].split(' --> ')[0];

    return {
      origTime: time,
      time: Number(time.replace(/:/g, '').replace(',', '')),
      text: item.slice(2).join('\n')
    };
  }).compact().value();

  return subtitles;

}

function joinSubtitles(subtitles, lang1, lang2) {

  const { name } = subtitles;
  const results = {
    name,
    subtitles: []
  };

  map(subtitles.langs[0], (l1item) => {
    if (!l1item || !l1item.text) return;

    const l1time = l1item.time;

    let distance = 999999;
    let closest;
    subtitles.langs[1].forEach((l2item, idx2) => {
      if (!l2item) return;

      const curDist = Math.abs(l1time - l2item.time);

      if (curDist < MAX_DIST && curDist < distance) {
        closest = l2item;
        closest.index = idx2;
        distance = Math.abs(l1time - l2item.time);
      }
    });

    if (closest) {
      l1item.index = null;
      closest.index = null;

      results.subtitles.push({
        title: name,
        time: l1item.origTime,
        [`text_${lang1}`]: l1item.text,
        [`text_${lang2}`]: closest.text
      });
    }
  });

  return results;

}

function getSubtitles(dir, files, lang1, lang2) {

  const subtitlesList = [];

  forEach(files, file => {
    const sub1 = fs.readFileSync(`${dir}/${file}.${lang1}.srt`, 'utf-8');
    const sub2 = fs.readFileSync(`${dir}/${file}.${lang2}.srt`, 'utf-8');

    subtitlesList.push(joinSubtitles({
      name: file,
      langs: [
        prepeareSubtitles(sub1),
        prepeareSubtitles(sub2)
      ]
    }, lang1, lang2));
  });

  return subtitlesList;

}

function getFiles(p) {
  return _(fs.readdirSync(p))
    .map(f => f.replace(/\..+\.srt/ig, ''))
    .uniq()
    .without('.DS_Store', 'results')
    .value();
}

function saveSubtitles(path, subtitles) {
  forEach(subtitles, item => fs.writeFile(`${path}/${item.name}.json`, JSON.stringify(item, null, '  ')));
}

function run(path, lang1, lang2) {
  const source = `${__dirname}/${path}`;
  const result = `${__dirname}/${path}/results`;

  try {
    fs.mkdirSync(result);
  } catch (e) {
    console.error(e.message); // eslint-disable-line
  }

  const files = getFiles(source);
  const subtitles = getSubtitles(source, files, lang1, lang2);

  saveSubtitles(result, subtitles);

  console.log(); // eslint-disable-line
  console.log('Subtitels merging complete!'); // eslint-disable-line
  console.log(); // eslint-disable-line
}

/**
 *
 * Argv parsing
 *
 */
let [n, p, path, lang1, lang2] = process.argv; // eslint-disable-line

if (!path) {
  console.log('Path should be set. npm run subtitles path'); // eslint-disable-line
  process.exit(0); // eslint-disable-line
}

run(path, lang1 || 'ru', lang2 || 'en');
