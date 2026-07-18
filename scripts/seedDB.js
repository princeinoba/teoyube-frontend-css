const promiseSearchSeeds = [
  {
    thumbnail: "https://github.com/princeinoba/teoyube-pics/blob/main/unsplash-18.jpg?raw=true",
    href: "http://www.recipezaar.com/Baked-Turkey-Sausage-Penne-327796",
    description: [
      "The eyes of your understanding being enlightened; ",
      "that ye may know what is the hope of his calling, ",
      "and what the riches of the glory of his inheritance in the saints, ",
      "-Ephesians 1:18- "
    ],
    title: "TEOYUBE; TYMAKWITHOHIS, CAWTROTGLOHINITS"
  },
  {
    thumbnail: "https://github.com/princeinoba/teoyube-pics/blob/main/unsplash-7.jpg?raw=true",
    href: "http://teoyube.com/Promises/Iatdobymiameni-Hesbesasgianoafip-Ephphatha/Bihetcitnotlo/Tbugodfohug/Video.aspx",
    description: [
      "We then, ",
      "as workers together with him, ",
      "beseech you also that ye receive not the grace of God in vain. ",
      "-2Corinthians 6:1- "
    ],
    title: "WETAWTWHIBYATYRNTGOGODIV"
  },
  {
    thumbnail: "https://github.com/princeinoba/teoyube-pics/blob/main/unsplash-10.jpg?raw=true",
    href: "http://teoyube.com/Promises/IATDOBYMIAMENI,HESBESASGIANOAFIP.EPHPHATHA;BIHETCITNOTLO.TBUGODFOHUG/Video.aspx",
    description: [
      "(For he saith, ",
      "I have heard thee in a time accepted, ",
      "and in the day of salvation have I succored thee: behold, ",
      "now is the day of salvation.) ",
      "-2Corinthians 6:2- "
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
