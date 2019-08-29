const state = require("./state");
const google = require("googleapis").google;
const imageDownloader = require("image-downloader");
const customSearch = google.customsearch("v1");

const googleSearchCredentials = require("../credentials/google-search.json");

async function robot() {
  const content = state.load();

  await fetchImagesOfAllSentences(content);
  await downloadAllImages(content);

  state.save(content);

  async function fetchImagesOfAllSentences(content) {
    for (const sentence of content.sentences) {
      const query = `${content.searchTerm} ${sentence.keywords[0]}`;
      sentence.images = await fetchGoogleAndReturnImagesLinks(query);

      sentence.googleSearchQeury = query;
    }
  }

  async function fetchGoogleAndReturnImagesLinks(query) {
    const response = await customSearch.cse.list({
      auth: googleSearchCredentials.apiKey,
      cx: googleSearchCredentials.searchEngineId,
      q: query,
      num: 2,
      searchType: "image",
      imgSize: "huge"
    });

    const imagesUrl = response.data.items.map(item => {
      return item.link;
    });

    return imagesUrl;
  }

  async function downloadAllImages(content) {
    content.downloadedImages = [];

    for (
      let sentenceIndex = 0;
      sentenceIndex < content.sentences.length;
      sentenceIndex++
    ) {
      const images = content.sentences[sentenceIndex].images;

      for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
        const imageUrl = images[imageIndex];

        try {
          if (content.downloadedImages.includes(imageUrl)) {
            throw new Error("Imagem já foi baixada");
          }

          await downloadImageAndSave(imageUrl, `${sentenceIndex}-original.png`);
          content.downloadedImages.push(imageUrl);
          console.log(`> Baixou imagem com sucesso: ${imageUrl}`);
          break;
        } catch (error) {
          console.log(`> Eror ao baixar imagem: ${error}`);
        }
      }
    }
  }

  function downloadImageAndSave(url, fileName) {
    return imageDownloader({
      url,
      dest: `./src/content/${fileName}`
    });
  }
}

module.exports = robot;
