const promiseSearchSeeds = [
  {
    thumbnail: "https://github.com/princeinoba/teoyube-pics/blob/main/unsplash-18.jpg?raw=true",
    href: "http://www.recipezaar.com/Baked-Turkey-Sausage-Penne-327796",
    description: [
      "having the eyes of your hearts enlightened, ",
      "that you may know what is the hope of his calling, ",
      "and what are the riches of the glory of his inheritance in the saints, ",
      "-Ephesians 1:18 · WEB- "
    ],
    title: "TEOYUBE; TYMAKWITHOHIS, CAWTROTGLOHINITS"
  },
  {
    thumbnail: "https://github.com/princeinoba/teoyube-pics/blob/main/unsplash-7.jpg?raw=true",
    href: "http://teoyube.com/Promises/Iatdobymiameni-Hesbesasgianoafip-Ephphatha/Bihetcitnotlo/Tbugodfohug/Video.aspx",
    description: [
      "Working together, ",
      "we entreat also that you do not receive the grace of God in vain. ",
      "-2 Corinthians 6:1 · WEB- "
    ],
    title: "WETAWTWHIBYATYRNTGOGODIV"
  },
  {
    thumbnail: "https://github.com/princeinoba/teoyube-pics/blob/main/unsplash-10.jpg?raw=true",
    href: "http://teoyube.com/Promises/IATDOBYMIAMENI,HESBESASGIANOAFIP.EPHPHATHA;BIHETCITNOTLO.TBUGODFOHUG/Video.aspx",
    description: [
      "For he says, “At an acceptable time I listened to you. ",
      "In a day of salvation I helped you.” ",
      "Behold, now is the acceptable time. ",
      "Behold, now is the day of salvation. ",
      "-2 Corinthians 6:2 · WEB- "
    ],
    title: "FOHSIHAHTIATAAITDOSHISTBNITDOS"
  }
];

async function seedDB(db) {
  if (!db?.Recipe) {
    console.log(JSON.stringify(promiseSearchSeeds, null, 2));
    return promiseSearchSeeds;
  }

  await db.Recipe.deleteMany({});
  const result = await db.Recipe.insertMany(promiseSearchSeeds);
  console.log(`${result.length} promise search records inserted.`);
  return result;
}

module.exports = {
  promiseSearchSeeds,
  seedDB
};
